// stores/cart.ts

import { useConfirmPopup } from "~/composables/useConfirmPopup"

export interface CartItem {
  id: number | string
  price: number
  quantity: number
  isChecked: boolean
  // Остальные поля товара
  [key: string]: any
}

export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref<CartItem[]>([])

  const addItem = (product: CartItem) => {
    items.value.push({ ...product, quantity: 1, isChecked: true })
    localStorage.setItem('cartLastUpdateTime', Date.now().toString())
  }

  const updateItemPrice = (product: CartItem, price: number) => {
    product.price = price
  }

  const incrementQuantity = (product: CartItem) => {
    product.quantity++
  }

  const removeItem = (product: CartItem) => {
    items.value = items.value.filter(item => item.id !== product.id)
    localStorage.setItem('cartLastUpdateTime', Date.now().toString())
  }

  const decrementQuantity = (product: CartItem) => {
    product.quantity--
  }

  const removeItems = (remItems: CartItem[]) => {
    const removeSet = new Set(remItems.map(item => item.id))
    items.value = items.value.filter(item => !removeSet.has(item.id))
    localStorage.setItem('cartLastUpdateTime', Date.now().toString())
  }

  const checkItem = (item: CartItem) => {
    item.isChecked = true
  }

  const uncheckItem = (item: CartItem) => {
    item.isChecked = false
  }

  const checkItems = () => {
    items.value.forEach(item => {
      item.isChecked = true
    })
  }

  const uncheckItems = () => {
    items.value.forEach(item => {
      item.isChecked = false
    })
  }

  const getItemById = (id: number | string): CartItem | undefined => {
    return items.value.find(item => item.id === id)
  }

  const totalPrice = computed<number>(() => {
    return items.value.reduce((total, product) => total + product.price * product.quantity, 0)
  })

  const checkedItems = computed<CartItem[]>(() => {
    return items.value.filter(item => item.isChecked)
  })

  const checkedTotalPrice = computed<number>(() => {
    return checkedItems.value.reduce((total, product) => total + product.price * product.quantity, 0)
  })

  const allChecked = computed<boolean>(() => {
    return items.value.length > 0 && items.value.every(item => item.isChecked)
  })

  const removeItemsFromCart = (remItems: CartItem[]) => {
    removeItems(remItems)
  }

  const addToCart = (item: CartItem) => {
    const existingItem = getItemById(item.id)
    if (existingItem) {
      incrementQuantity(existingItem)
    } else {
      addItem(item)
    }
  }

  const decreaseQuantity = (item: CartItem) => {
    const product = getItemById(item.id)
    if (product) {
      decrementQuantity(product)
    }
  }

  const removeFromCart = async (item: CartItem): Promise<void> => {
    const product = getItemById(item.id)
    if (!product) return
    
    const confirmPopUp = useConfirmPopup()
    const ques = await confirmPopUp("Удалить товар из корзины?")

    if (ques) {
      removeItem(product)
    }
  }

  const toggleChecked = (item: CartItem) => {
    if (item.isChecked) {
      uncheckItem(item)
    } else {
      checkItem(item)
    }
  }

  const getCartFromStorage = () => {
    items.value = JSON.parse(localStorage.getItem('cart') || '[]')
  }

  const saveCartToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const updatePrices = async (): Promise<void> => {
    console.log('Updating prices for cart items...');
    const twoHoursInMs = 2 * 60 * 60 * 1000
    const currentTime = Date.now()
    // Если метка времени отсутствует, используем время "2 часа назад + 10 секунд"
    const lastUpdateTime =
      parseInt(localStorage.getItem('cartLastUpdateTime') || '0', 10) ||
      (Date.now() - twoHoursInMs - 10000)

    if (currentTime - lastUpdateTime > twoHoursInMs) {
      const productsItemsIDs = items.value.map(item => item.id)
      if(productsItemsIDs.length <= 0) return

      const data = ref<{ products: CartItem[] }>();
      const { data: apiData } = await useAPI(`/productsGetter`, {
        key: `productsGetter-${JSON.stringify(productsItemsIDs)}-data`,
        params: {
          product_ids: JSON.stringify(productsItemsIDs),
        },
      })
      const response = apiData.value as { products: CartItem[] };
      console.log('response: ', response);
      data.value = response;

      const updatedItems = data.value?.products || []
      updatedItems.forEach(updatedItem => {
        const existingItem = getItemById(updatedItem.id)
        if (existingItem) {
          updateItemPrice(existingItem, updatedItem.price)
        }
      })
      localStorage.setItem('cartLastUpdateTime', currentTime.toString())

    }
  }

  return {
    items,
    addItem,
    updateItemPrice,
    incrementQuantity,
    removeItem,
    decrementQuantity,
    removeItems,
    checkItem,
    uncheckItem,
    checkItems,
    uncheckItems,
    removeItemsFromCart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    toggleChecked,
    saveCartToStorage,
    getCartFromStorage,
    updatePrices,
    getItemById,
    totalPrice,
    checkedItems,
    checkedTotalPrice,
    allChecked,
  }
})

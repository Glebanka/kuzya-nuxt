// stores/cart.ts

import { useConfirmPopup } from "~/composables/useConfirmPopup"

export interface CartItem {
  id: number | string
  price: number
  quantity: number
  isChecked: boolean
  // Остальные поля товара
  [key: string]: any
  status: boolean
}

export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref<CartItem[]>([])

  // mutations
  const addItem = (product: CartItem) => {
    items.value.push({ ...product, quantity: 1, isChecked: true })
    localStorage.setItem('cartLastUpdateTime', Date.now().toString())
  }

  const updateItemPriceAndStatus = (product: CartItem, price: number, status: boolean) => {
    product.price = price;
    product.status = status;
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

  // actions
  const checkAllItems = () => {
    items.value.forEach(item => {
      item.isChecked = true
    })
  }

  const uncheckAllItems = () => {
    items.value.forEach(item => {
      item.isChecked = false
    })
  }

  const toggleChecked = (item: CartItem) => {
    if (item.isChecked) {
      uncheckItem(item)
    } else {
      checkItem(item)
    }
  }

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

  const getCartFromStorage = () => {
    items.value = JSON.parse(localStorage.getItem('cart') || '[]')
  }

  const saveCartToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const updateCartProducts = async (): Promise<void> => {

    const productsItemsIDs = items.value.map(item => item.id)
    if (productsItemsIDs.length <= 0) return

    const data = ref<{ products: CartItem[] }>();
    const { data: apiData } = await useAPI(`/productsGetter`, {
      key: `productsGetter-${JSON.stringify(productsItemsIDs)}-data`,
      params: {
        product_ids: JSON.stringify(productsItemsIDs),
      },
    })
    const response = apiData.value as { products: CartItem[] };
    data.value = response;

    const updatedItems = data.value?.products || []
    updatedItems.forEach(updatedItem => {
      const existingItem = getItemById(updatedItem.id)
      if (existingItem) {
        updateItemPriceAndStatus(existingItem, updatedItem.price, updatedItem.status)
      }
    })

  }

  // getters
  const getItemById = (id: number | string): CartItem | undefined => {
    return items.value.find(item => item.id === id)
  }

  const checkedItems = computed<CartItem[]>(() => {
    return items.value.filter(item => item.isChecked)
  })

  const productsUnavailable = computed<CartItem[]>(() => {
    return items.value.filter(item => item.status === false)
  })

  const productsAvailable = computed<CartItem[]>(() => {
    return items.value.filter(item => item.status === true)
  })

  const validItems = computed<CartItem[]>(() => {
    return items.value.filter(item => item.isChecked && item.status)
  })

  const validTotal = computed<number>(() => {
    return validItems.value.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  })

  return {
    items,
    addItem,
    incrementQuantity,
    removeItem,
    decrementQuantity,
    removeItems,
    checkItem,
    uncheckItem,
    checkAllItems,
    uncheckAllItems,
    removeItemsFromCart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    toggleChecked,
    saveCartToStorage,
    getCartFromStorage,
    updateCartProducts,
    getItemById,
    validItems,
    validTotal,
    checkedItems,
    productsUnavailable,
    productsAvailable,
  }
})

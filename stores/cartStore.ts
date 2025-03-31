// stores/cart.ts

export interface CartItem {
  id: number | string
  price: number
  quantity: number
  isChecked: boolean
  // Остальные поля товара
  [key: string]: any
}

// Если confirmPopUp используется, опишите его тип, например:
// export const confirmPopUp: (message: string) => Promise<boolean> = async (message) => { /* ... */ }

export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref<CartItem[]>(typeof localStorage !== 'undefined' ?
    JSON.parse(localStorage.getItem('cart')|| '[]') : [])

  const addItem = (product: CartItem) => {
    items.value.push({ ...product, quantity: 1, isChecked: true})
  }

  const updateItemPrice = (product: CartItem, price: number) => {
    product.price = price
  }

  const incrementQuantity = (product: CartItem) => {
    product.quantity++
  }

  const removeItem = (product: CartItem) => {
    items.value = items.value.filter(item => item.id !== product.id)
  }

  const decrementQuantity = (product: CartItem) => {
    product.quantity--
  }

  const removeItems = (remItems: CartItem[]) => {
    const removeSet = new Set(remItems.map(item => item.id))
    items.value = items.value.filter(item => !removeSet.has(item.id))
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

  const addToCart = (item : CartItem) => {
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
    // Если функция confirmPopUp используется, раскомментируйте и замените её на свою реализацию
    // const ques = await confirmPopUp("Удалить товар из корзины?")
    // if (ques) {
    //   removeItem(product)
    // }
    // Для простоты здесь просто удаляем
    removeItem(product)
  }

  const toggleChecked = (item: CartItem) => {
    if (item.isChecked) {
      uncheckItem(item)
    } else {
      checkItem(item)
    }
  }

  const saveCartToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  // const updatePrices = async (): Promise<void> => {
  //   const twoHoursInMs = 2 * 60 * 60 * 1000
  //   const currentTime = Date.now()
  //   // Если метка времени отсутствует, используем время "2 часа назад + 10 секунд"
  //   const lastUpdateTime =
  //     parseInt(localStorage.getItem('cartLastUpdateTime') || '0', 10) ||
  //     (Date.now() - twoHoursInMs - 10000)

  //   if (currentTime - lastUpdateTime > twoHoursInMs) {
  //     const productsItemsIDs = items.value.map(item => item.id)
  //     try {
  //       const response = await axios.get('/api/productsGetter', {
  //         params: {
  //           product_ids: JSON.stringify(productsItemsIDs),
  //         },
  //       })
  //       // Предположим, что сервер возвращает массив объектов с id и price
  //       const updatedItems: { id: number | string; price: number }[] = response.data.products
  //       updatedItems.forEach(updatedItem => {
  //         const existingItem = getItemById(updatedItem.id)
  //         if (existingItem) {
  //           updateItemPrice(existingItem, updatedItem.price)
  //         }
  //       })
  //       localStorage.setItem('cartLastUpdateTime', currentTime.toString())
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }
  // }

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
    // updatePrices,
    getItemById,
    totalPrice,
    checkedItems,
    checkedTotalPrice,
    allChecked,
  }
})

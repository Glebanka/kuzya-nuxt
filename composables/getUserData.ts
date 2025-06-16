// если данные пользователя еще не загружены, подписываемся на их загрузку, а потом вызываем callback
export const useGetUserData = (callback: Function) => {
    if (Object.keys(useAuthStore().userData).length === 0) {
        useAuthStore().$onAction(({ name, after }) => {
            if (name == 'getUserData') {
                after(() => {
                    callback()
                })
            }
        })
    } else {
        callback()
    }
}

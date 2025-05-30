export const useConfirmPopup = () => {
  const show = useState<((msg: string) => Promise<boolean>)>('confirmPopUp')

  if (!show.value) {
    throw new Error('ConfirmPopUp not initialized')
  }

  return show.value
}
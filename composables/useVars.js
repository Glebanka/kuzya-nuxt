import { ref } from "vue";

export const useVars = () => {
  const documentWidth = ref(0);
  const documentHeight = ref(0);
  const isDesktop = ref(true);

  if(import.meta.client){
    documentWidth.value = document.documentElement.clientWidth + (window.innerWidth - document.body.offsetWidth);
    documentHeight.value = document.documentElement.clientHeight;
    isDesktop.value = documentWidth.value > documentHeight.value;
  }
  return { isDesktop }
}

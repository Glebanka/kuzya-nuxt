import { ref } from "vue";

export const useVars = () => {
  const documentWidth = ref(0);
  const documentHeight = ref(0);
  const isDesktop = ref(true);
  const $body = ref(null);
  const $page = ref(null);

  if(import.meta.client){
    documentWidth.value = document.documentElement.clientWidth + (window.innerWidth - document.body.offsetWidth);
    documentHeight.value = document.documentElement.clientHeight;
    isDesktop.value = documentWidth.value > documentHeight.value;
    $body.value = document.querySelector('body')
  }
  return {
    isDesktop,
    $body,
   }
}

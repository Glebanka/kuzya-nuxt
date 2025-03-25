import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.client) {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
      }
    
      return {
        provide: {
          gsap,
          ScrollTrigger
        },
      };
})
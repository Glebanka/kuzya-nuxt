<script>
import { mapState } from 'pinia'

export default {
  data() {
    return {
      configs: []
    }
  },
  provide() {
    return {
      configs: computed(() => this.configs),
      openPopUpMenu: this.openPopUpMenu,
      getUserAvatar: () => this.getUserAvatar(),
    }
  },
  methods: {
    openAuthPopUp() {
      this.$refs.authPopUp.open()
    },
    closeAuthPopUp() {
      this.$refs.authPopUp.close()
    },
    async getUserAvatar() {
      if (this.isAuthenticated) {
        const response = await useNuxtApp().$apiFetch(`/user-data`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
        })
        this.userAvatar = response.data.user.image;
      }
    },
    openPopUpMenu(menuType) {
      if (menuType == 'default') {
        this.$refs.popUpMenu.openMenu('default');
      } else if (menuType == 'person') {
        this.$refs.popUpMenu.openMenu('person');
      }
    },
    clickScrollTo(id, _offset = 120) {
      let minMarginTop = _offset;
      if (id) {
        let el = document.querySelector(`#${id}`);
        if (el) {
          let offset = getCoords(el).top;
          gsap.to(window, { duration: 1, scrollTo: (offset - minMarginTop) });
        }
      }
    },
    setSearchProducts(products) {
      this.searchProducts = products;
    },
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'isAuthenticated']),
  },
  mounted() {
    this.getUserAvatar()
  }
}
</script>

<template>
  <Header />
  <NuxtPage />
  <PopUpMenu ref="popUpMenu"></PopUpMenu>
  <Footer />
  <!-- <AuthPopUp ref="authPopUp"></AuthPopUp> -->
</template>
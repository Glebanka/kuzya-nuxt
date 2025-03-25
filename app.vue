<script>
import { mapState } from 'pinia';
import { useAuthStore } from './stores/authStore';
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
    getUserAvatar() {
      if (this.isAuthenticated) {
        axios.get('/api/user-data', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }).then(res => {
          if (res.data.success === true) {
            this.userAvatar = res.data.user.image;
          }
        }).catch(err => {
          // Проверяем, если это не стандартная ошибка "Unauthenticated.", 
          // то выводим сообщение об ошибке в консоль
          if (err.response.data.message !== "Unauthenticated.") {
            console.log(err);
          }
        })
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
}
</script>

<template>
  <Header />
  <NuxtPage />
  <PopUpMenu ref="popUpMenu"></PopUpMenu>
  <Footer />
  <!-- <AuthPopUp ref="authPopUp"></AuthPopUp> -->
</template>
<script setup>
const breadcrumbs = ref([]);
const aboutPage = ref({});
const isAnimActive = ref(false);

const { data } = await useGetData('/pages', { 
    params: { url_page: '/payment-security' },
    key: 'payment-security-page-data'
});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

onMounted(() => {
  isAnimActive.value = true;
})
</script>

<template>
  <main class="main default-page">
    <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
    <section class="">
      <div class="container default-content anim-item" :class="{ 'anim-item-active': isAnimActive }">
        <h1 v-html="aboutPage.headline"></h1>
        <div class="payment-logos">
          <img class="visa" src="~/assets/img/Visa.png" alt="visa payment system">
          <div class="mastercard">
            <img class="mastercard-img" src="~/assets/img/MasterCard.png"
              alt="mastercard payment system">
            <p class="mastercard-text">mastercard</p>
          </div>
          <img class="mir" src="~/assets/img/Mir.png" alt="mir payment system">
          <img class="paygine" src="~/assets/img/paygine.png"
            alt="paygine payment system">
        </div>
        <div v-html="aboutPage.content"></div>
      </div>
    </section>
    <info-actions-form></info-actions-form>
  </main>
</template>

<style scoped>
.payment-logos {
  display: flex;
  align-items: end;
  margin-bottom: 2rem;
  gap: 0.8rem;
}

.visa {
  width: 10rem;
  height: 4rem;
  object-fit: cover;
  object-position: center center;
}

.mastercard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.mastercard-img {
  width: 6rem;
  height: 3.7rem;
  object-fit: cover;
  object-position: center center;
}

.mastercard-text {
  font-size: .9rem;
  margin-bottom: 0;
  font-weight: 600;
}

.mir {
  width: 10rem;
  height: 4rem;
  object-fit: cover;
  object-position: center center;
}

.paygine {
  width: 10rem;
  height: 7rem;
  object-fit: cover;
  object-position: center center;
}
</style>

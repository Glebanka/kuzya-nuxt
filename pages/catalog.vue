<script>
export default {
  async setup() {
    const { data } = await useGetData(`/catalog/`, {
      key: `catalog-list-data`
    });

    const breadcrumbs = ref([{ ['Каталог']: '' }]);
    const aboutPage = ref({
      headline: 'Каталог',
    });
    useSeoMeta({ title: 'Каталог' })


    const categoriesParent = ref(data.value?.categoriesParent || []);
    const categoriesChild = ref(Object.values(data.value?.categoriesChild || []));


    return {
      breadcrumbs,
      aboutPage,
      categoriesParent,
      categoriesChild,
    }
  },
  methods: {
    getCategoriesChild(parent_id) {
      return this.categoriesChild.filter(category => category.id_parent === parent_id)
    },
    workList() {
      const $btns = selectElements('.show-list__js');
      if ($btns.length) {
        $btns.forEach(($btn, indx) => {
          $btn.addEventListener('click', () => {
            $btn.classList.toggle('_active');
            if ($btn.classList.contains('_active')) {
              setClass($btn.parentElement.querySelectorAll('.cover'), { remove: 'hidden' });
            } else {
              setClass($btn.parentElement.querySelectorAll('.cover'), { add: 'hidden' });
            }
          })
        });
      }
    },
  },
  mounted() {
    this.workList()
  },
}
</script>

<template>
  <main class="main">
    <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
    <section class="list-catalog">
      <div class="list-catalog__container container">
        <h1 class="list-catalog__title anim-item anim-item-active">{{ aboutPage.headline }}
        </h1>
        <div class="list-catalog__categories g-4">
          <div v-for="categoryParent in categoriesParent" class="list-catalog-category anim-item" v-anim-scroll>

            <router-link :to="'/catalog/' + categoryParent.url_page + '/'" class="list-catalog-category__name">
              {{ categoryParent.headline }}
            </router-link>
            <!--                        <p  class="list-catalog-category__name">-->
            <!--                            {{ categoryParent.headline }}-->
            <!--                        </p>-->
            <ul class="list-style-none list-catalog-category__list">
              <template v-for="(categoryChild, indx) in getCategoriesChild(categoryParent.id)">
                <li :class="{ 'cover': indx > 4, 'hidden': indx > 4 }">
                  <router-link :to="'/catalog/' + categoryParent.url_page + '/' + categoryChild.url_page + '/'">
                    {{ categoryChild.headline }}
                  </router-link>
                </li>
              </template>
              <div class="list-catalog-category__more show-list show-list__js"
                :class="{ 'hidden': getCategoriesChild(categoryParent.id).length <= 5 }">
                <span>Еще {{ getCategoriesChild(categoryParent.id).length - 5 }}</span>
                <span>Свернуть</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M15.7722 6.23432C16.0759 6.54673 16.0759 7.05327 15.7722 7.36569L9.54997 13.7657C9.24623 14.0781 8.75377 14.0781 8.45003 13.7657L2.22781 7.36569C1.92406 7.05327 1.92406 6.54673 2.22781 6.23431C2.53155 5.9219 3.02401 5.9219 3.32775 6.23431L9 12.0686L14.6722 6.23432C14.976 5.9219 15.4685 5.9219 15.7722 6.23432Z"
                    fill="#1D1D1D" />
                </svg>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <info-actions-form></info-actions-form>
  </main>
</template>

<style scoped></style>
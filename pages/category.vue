<script>
export default {
    async setup() {
        const configs = inject('configs')

        const route = useRoute()
        // Проверяем, что category существует и является массивом или строкой
        const cleanedCategory = computed(() => {
            const p = route.params.category
            const arr = Array.isArray(p) ? p : [p]
            return arr.filter(item => typeof item === 'string' && item.trim() !== '')
        })
        const categoryPath = computed(() => {
            return cleanedCategory.value
                .map(seg => encodeURIComponent(seg))  // экранируем спецсимволы
                .join('/')
        })

        const data = ref({});
        const { data: cachedData } = useNuxtData(`catalog-${categoryPath.value}-data`);
        if (cachedData.value) {
            data.value = cachedData.value;
        } else {
            const { data: apiData } = await useAPI(`/catalog/${categoryPath.value}`, {
                key: `catalog-${categoryPath.value}-data`,
            })
            data.value = apiData.value;
        }


        const breadcrumbs = ref(data.value?.breadcrumbs || []);
        const category = ref(data.value?.category || []);


        useSeoMeta(useMetaTags(reactive({
            data: data.value.category,
            meta: configs.value,
        })));


        const btns = ref([]);
        if (data.value.childrenCategories) {
            btns.value = Object.values(data.value.childrenCategories).map(category => {
                return { name: category.headline, link: category.url_page + '/' + category.url_page };
            });
        }



        return {
            breadcrumbs,
            category,
            btns,
            cleanedCategory,
        };
    },
    data() {
        return {
            productsCount: 0,
            inStock: false,
            updateFilter: [],
            filterPopupUpdate: '',
        }
    },
    provide() {
        return {
            updateFilter: computed(() => this.updateFilter),
            setUpdateFilter: (filters) => this.setUpdateFilter(filters),
            inStock: computed(() => this.inStock),
            setInstock: () => this.setInstock(),
            setEnableInstock: () => this.setEnableInstock(),
            setDesableInstock: () => this.setDesableInstock(),
            changeFilterPopup: () => this.changeFilterPopup(),
        };
    },
    methods: {
        setUpdateFilter(filters) {
            this.updateFilter = [];
            this.updateFilter.push(filters);
        },
        setInstock() {
            this.inStock = !this.inStock;
        },
        getProductsCount(productsCount) {
            this.productsCount = productsCount;
        },

        setEnableInstock() {
            this.inStock = true;
        },
        setDesableInstock() {
            this.inStock = false;
        },
        changeFilterPopup(filterProperty) {
            this.filterPopupUpdate = filterProperty;
        },
    },
}
</script>

<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="catalog-categories">
            <div class="catalog-categories__container container">
                <h1 class="catalog-categories__title">{{ category.headline }}</h1>
                <BtnsSelect class="catalog-categories__btn-select" :items="btns" />
            </div>
        </section>
        <Filter v-if="cleanedCategory.length > 1" :productsCount="productsCount" @changeFilterPopup="changeFilterPopup" />
        <list-products @getCount="getProductsCount" :category-id="category.id"></list-products>
        <InfoActionsForm />
    </main>
    <FilterPopup :filterPopupUpdate="filterPopupUpdate" v-if="category && cleanedCategory.length > 1" :category-id="category.id" />
</template>

<style scoped></style>

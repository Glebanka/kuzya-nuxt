<script>
export default {
    props: [
        'discounts'
    ],
    mounted() {
    },
    methods: {
        getImagePath(image) {
            return `${useRuntimeConfig().public.imgBaseURL}/storage/${image}`;
        },
        getFilterTabs(tabs) {
            return tabs.reduce((acc, tab) => acc + ' filter-' + tab.id, '');
        }
    },
}
</script>

<template>
    <div class="all-actions__list g-3 g-gap-30">
        <div v-for="discount in discounts" :key="discount.id" :class="'all-actions-item slider-actions-item' +
            getFilterTabs(discount.tabs) + ' anim-item'" v-anim-scroll>
            <router-link :to="'/discounts/' + discount.url_page+'/'" class="slider-actions-item__body">
                <picture>
                    <img :src="getImagePath(discount.image)" :alt="discount.image_alt">
                </picture>
            </router-link>
        </div>
    </div>
</template>

<style scoped>

</style>

<script>

export default {
    data() {
        return {
            length: 0,
        }
    },
    props: {
        breadcrumbs: Array,
    },
    methods: {
        getBreadCrumbs() {
            if(this.breadcrumbs) {
                this.length = this.breadcrumbs.length === undefined ? 1: this.breadcrumbs.length;
            }
        }
    },
    mounted() {
        this.getBreadCrumbs()
    },
    watch: {
        breadcrumbs: {
            handler(val) {
                this.length = val.length;
            },
            deep: true
        }
    }
}

</script>

<template>
    <section class="breadcrumbs-block anim-item" :class="{'anim-item-active': breadcrumbs && breadcrumbs.length}">
        <div class="breadcrumbs-block__container container">
            <router-link to="/">Главная</router-link> /
            <template v-if="breadcrumbs" v-for="(breadcrumb, index) in breadcrumbs" :key="index">
                <template v-if="index !== length - 1">
                    <router-link :to="Object.values(breadcrumb)[0]+'/'">{{ Object.keys(breadcrumb)[0]}}</router-link> /
                </template>
                <template v-else>
                    <span>{{ Object.keys(breadcrumb)[0] }}</span>
                </template>
            </template>
        </div>
    </section>
</template>

<style scoped>

</style>

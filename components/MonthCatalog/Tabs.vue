<script>
export default {
    name: 'Tabs',
    props: {
        tabs: Array,
    },
    data() {
        return {
            currentTab: 0,
        }
    },
    methods: {
        selectTab(e, indx){
            this.currentTab = indx;
            e.target.closest('.tabs').querySelector('.tab-item-block._active').classList.remove('_active');
            e.target.closest('.tabs').querySelectorAll('.tab-item-block')[indx].classList.add('_active');
        }
    },
}
</script>
<template>
    <div v-if="tabs.length" class="month-catalog-tab__head tab-head">
        <template v-for="(tab, indx) in tabs" :key="'catalogTab'+indx">
            <div class="anim-item" v-anim-scroll>
                <div class="tab-item default-anim btn-2" v-anim-hover :class="{ '_active': indx === this.currentTab }" @click="selectTab($event, indx)">
                   Каталог {{ tab.name }}
                </div>
            </div>
        </template>
    </div>
</template>
<style></style>
<script>

export default {
    props: {
        items: Array,
    },
    data() {
        return {
            activeItem: 0,
            isActiveSelect: false,
        }
    },
    computed: {
        getActiveItemName() {
            return this.items[this.activeItem].name;
        }
    },
    methods: {
        toggleSelect(e) {
            this.isActiveSelect = !this.isActiveSelect;
        },
        closeSelect() {
            this.isActiveSelect = false;
        },
        selectItem(indx) {
            this.isActiveSelect = false;
            this.activeItem = indx;
        },
    },
    mounted() {
        let ESC = 27;
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === ESC) {
                this.closeSelect();
            }
        });
        document.addEventListener('mouseup', (e) => {
            let btnSelect = document.querySelector('.btn-select');
            if (btnSelect && btnSelect.contains(e.target) === false){
                this.closeSelect();
            }
        });
    }


}
</script>

<template>
    <div v-if="items.length" class="btn-select" :class="[isActiveSelect ? '_active' : '']">
        <div class="btn-select__head" @click="toggleSelect">
            <div class="btn-select__label">{{ getActiveItemName }}</div>
        </div>
        <div class="btn-select__body">
            <div class="btn-select__content">
                <div v-for="(item, indx) in items" class="btn-select__item"
                     :class="[indx === activeItem ? '_active' : '']" @click="selectItem(indx)">
                        <router-link :to="item.link + '/'" class="btn-border default-anim" v-anim-hover
                        :class="{ 'active': item.active }">
                            {{ item.name }}
                        </router-link>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.btn-border {
    &.active {
        color: var(--white);
        pointer-events: none;

        &:after {
            opacity: 1;
            clip-path: circle(160% at var(--x) var(--y));
        }
    }
}
</style>

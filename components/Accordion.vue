<script setup>
const { title } = defineProps(['title'])

const isActive = ref(false);

const accordion = ref(null)
const accordionContent = ref(null)
const accordionPreview = ref(null)
const accordionTitle = ref(null)

const contentGap = remToPixels(2.4);

const accordionPreviewHeight = computed(() => accordionPreview.value?.scrollHeight ? (accordionPreview.value.scrollHeight + contentGap) : 0)
const accordionTitleHeight = computed(() => accordionTitle.value.scrollHeight);
const accordionInitHeight = computed(() => remToPixels(4.8) + accordionTitleHeight.value + accordionPreviewHeight.value);

const accordionHeight = computed(() => {
    if (isActive.value) {
        // remToPixels(2.4) - padding снизу
        return accordionInitHeight.value + accordionContent.value.scrollHeight + remToPixels(2.4);
    } else {
        return accordionInitHeight.value;
    }
})
const accordionHeightCssString = computed(() => `${accordionHeight.value}px`)
const contentTopCssString = computed(() => `${accordionInitHeight.value}px`)
</script>
<template>
    <div ref="accordion" class="accordion" :class="{ active: isActive }" @click="isActive = !isActive;">
        <div ref="accordionTitle" class="accordion__title">{{ title }}</div>
        <div v-if="!!(useSlots().preview && useSlots().preview().length)" ref="accordionPreview" class="accordion__preview" @click.stop>
            <slot name="preview"></slot>
        </div>
        <div ref="accordionContent" class="accordion__content" @click.stop>
            <slot name="content"></slot>
        </div>
    </div>
</template>
<style lang="scss">
.accordion {
    width: 100%;
    height: v-bind('accordionHeightCssString');

    position: relative;

    display: flex;
    flex-flow: column;
    gap: 2.4rem;
    padding: 2.4rem;

    border-radius: 2rem;
    border: 0.5px solid rgba(87, 87, 87, 0.4);
    cursor: pointer;

    transition: height 0.3s;

    &.active {
        .accordion__content {
            pointer-events: all;
            opacity: 1;

            transition: opacity 0.3s 0.1s;
        }

        .accordion__title {
            &:after {
                display: block;
            }

            &:before {
                display: none;
            }
        }
    }
}

.accordion__title {
    font-size: 1.8rem;
    line-height: 1;
    font-weight: 600;

    position: relative;

    &:before,
    &:after {
        content: '';
        width: 2rem;
        height: 2rem;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;

        background-position: center;
        background-repeat: no-repeat;
        background-size: 2rem;
    }

    &:after {
        background-image: url('~/assets/img/svg/minus-icon.svg');
        display: none;
    }

    &:before {
        background-image: url('~/assets/img/svg/plus-icon.svg');
    }
}

.accordion__content {
    cursor: auto;
    
    position: absolute;
    pointer-events: none;
    opacity: 0;
    top: v-bind('contentTopCssString');
    
    transition: opacity 0.2s;
}
.accordion__preview {
    cursor: auto;
    
    transition: opacity 0.2s;
}
</style>
<script setup>
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const tabs = ref([]);
const catalogs = ref([]);


const { data } = await useAPI(`/month-catalog`);
if (data.value?.date?.length) {
    tabs.value = data.value.date.map(item => ({ name: item.name }));
    catalogs.value = data.value.date;
}

onMounted(() => {
    nextTick(() => {
        initNativeJs();
    });
});

function initNativeJs() {
    const $sliders = selectElements('.month-catalog__slider');
    if ($sliders.length) {
        $sliders.forEach((slider, indx) => {
            const fullScreen = slider.closest('.tab-item-block').querySelector('.click-fullscreen-catalog__js');
            const swiper = new Swiper(slider.querySelector('.month-catalog__slider-body'), {
                modules: [Navigation, Pagination],
                slidesPerView: 'auto',
                spaceBetween: 0,
                navigation: {
                    nextEl: [slider.querySelector('.slider-arrow__js.right'), slider.closest('.tab-item-block').querySelector('.month-catalog-counter__arrow.right')],
                    prevEl: [slider.querySelector('.slider-arrow__js.left'), slider.closest('.tab-item-block').querySelector('.month-catalog-counter__arrow.left')],
                },
            });

            if (slider.closest('.tab-item-block').querySelector('.month-catalog-counter__num .total')) {
                slider.closest('.tab-item-block').querySelector('.month-catalog-counter__num .total').textContent = slider.querySelectorAll('.swiper-slide').length;
            }

            swiper.on('slideChange', function (e) {
                slider.closest('.tab-item-block').querySelector('.month-catalog-counter__num .current').textContent = swiper.realIndex + 1;
            });

            if (fullScreen) {
                fullScreen.addEventListener('click', () => {
                    slider.querySelector('.swiper-slide-active a').click();
                });
            }

        });
    }

    function fullScreenGallery() {
        const $galleries = selectElements('.lightgallery');
        if ($galleries.length) {
            $galleries.forEach(($item, indx) => {
                lightGallery($item, {
                    selector: 'a',
                    plugins: [lgZoom, lgThumbnail],
                    licenseKey: 'your_license_key',
                    speed: 500,
                    thumbnail: false,
                    download: false,
                    alignThumbnails: 'middle',
                    actualSizeIcons: false,
                    mobileSettings: {
                        showCloseIcon: true,
                        download: false,
                    },

                    // ... other settings
                });
            });
        }
    }
    fullScreenGallery();
}
</script>
<!-- гарантий что этот компонент работает нету -->
<template>
    <section class="month-catalog" v-if="catalogs.length">
        <div class="month-catalog__container container">
            <month-catalog-text-content></month-catalog-text-content>
            <div class="month-catalog__tabs tabs">
                <tabs :tabs="tabs"></tabs>
                <body-catalogs :catalogs="catalogs"></body-catalogs>
            </div>
        </div>
    </section>
</template>
<style></style>

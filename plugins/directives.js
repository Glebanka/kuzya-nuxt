export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.client) {
        nuxtApp.vueApp.directive('anim-hover', animHover)
        nuxtApp.vueApp.directive('anim-scroll', animScroll)
        nuxtApp.vueApp.directive('tabs', tabs)
    } else {
        nuxtApp.vueApp.directive('anim-hover', ssrProps);
        nuxtApp.vueApp.directive('anim-scroll', ssrProps)
        nuxtApp.vueApp.directive('tabs', ssrProps)
    }
})

const animHover = {
    mounted($item, data) {
        let { isDesktop } = useVars();

        if ($item && isDesktop) {

            let isHovered = false;

            $item.addEventListener('mouseenter', handleMouseEnter);
            $item.addEventListener('mouseleave', handleMouseLeave);
            $item.addEventListener('click', (e) => {
                if (e.target.closest('a')) {
                    isHovered = false;
                    $item.classList.remove('_hover');
                }
            });

            function getMousePosition(e, $item) {
                const coords = getCoords($item);
                return {
                    x: e.pageX - coords.left,
                    y: e.pageY - coords.top
                };
            }

            function handleMouseEnter(e) {
                const { x, y } = getMousePosition(e, this);
                this.style.setProperty('--x', `${x}px`);
                this.style.setProperty('--y', `${y}px`);
                isHovered = true;
                setTimeout(() => {
                    if (isHovered) {
                        this.classList.add('_hover');
                    }
                }, 50);
            }

            function handleMouseLeave(e) {
                const { x, y } = getMousePosition(e, this);
                this.style.setProperty('--x', `${x}px`);
                this.style.setProperty('--y', `${y}px`);
                isHovered = false;
                this.classList.remove('_hover');
            }
        }
    },
}
const animScroll = {
    mounted(animItem, data) {
        const { $gsap, $ScrollTrigger } = useNuxtApp();
        const { isDesktop } = useVars();

        let _startTrigger = animItem.dataset.startTrigger ? animItem.dataset.startTrigger : 0;
        let _startTrig = `0% 95%`;
        if (_startTrigger) {
            if (getNormalTrigger(animItem, _startTrigger)[0]) {
                _startTrig = `${getNormalTrigger(animItem, _startTrigger)[0]} 60%`;
                if (getNormalTrigger(animItem, _startTrigger)[1]) {
                    _startTrig = `${getNormalTrigger(animItem, _startTrigger)[0]} ${getNormalTrigger(animItem, _startTrigger)[1]}`;
                    // console.log(_startTrig)
                }
            }
        }
        let _endTrigger = animItem.dataset.endTrigger ? animItem.dataset.endTrigger : 0;
        let _endTrig = `60% 0%`;
        if (_endTrigger) {
            if (getNormalTrigger(animItem, _startTrigger)[1]) {
                _endTrig = `${getNormalTrigger(animItem, _endTrigger)[0]} 0%`
                if (getNormalTrigger(animItem, _endTrigger)[1]) {
                    _endTrig = `${getNormalTrigger(animItem, _endTrigger)[0]} ${getNormalTrigger(animItem, _endTrigger)[1]}`
                }
            }
        }

        $gsap.to(animItem, {
            scrollTrigger: {
                trigger: animItem,
                start: _startTrig,
                end: _endTrig,
                markers: animItem.dataset.marker ? 1 : 0,
                onEnter() {
                    if (isDesktop) {
                        let benefitsItem = animItem.closest('.our-benefits-item');
                        if (benefitsItem) {
                            ftransitionDelayItem(animItem, getIndex(animItem, animItem.parentElement.querySelectorAll('.our-benefits-item')), 0, 150, 3)
                        }

                        let tabItem = animItem.closest('.tab-head');
                        if (tabItem) {
                            ftransitionDelayItem(animItem, getIndex(animItem, animItem.parentElement.querySelectorAll('.anim-item')), 0, 150, 3)
                        }

                        let catalog = animItem.closest('.list-catalog-category');
                        if (catalog) {
                            ftransitionDelayItem(animItem, getIndex(animItem, animItem.parentElement.querySelectorAll('.anim-item')), 0, 150, 4)
                        }

                        let catalogProduct = animItem.closest('.card-product__body');
                        if (catalogProduct) {
                            if (animItem.closest('.list-products') && animItem.closest('.list-products').querySelectorAll('.anim-item').length) {
                                ftransitionDelayItem(animItem, getIndex(animItem, animItem.closest('.list-products').querySelectorAll('.anim-item')), 0, 150, 4)
                            }
                        }

                        let actionsList = animItem.closest('.all-actions-item');
                        if (actionsList) {
                            ftransitionDelayItem(animItem, getIndex(animItem, animItem.parentElement.querySelectorAll('.anim-item')), 0, 150, 3)
                        }


                    }
                    animItem.classList.add('anim-item-active');
                }
            }
        })
        $ScrollTrigger.refresh();
    }
}
const tabs = {
    mounted(tab, data) {
        let tabs = new Tabs(tab);
    },
}


const ssrProps = {
    // Обязательный метод для SSR, чтобы избежать ошибки
    getSSRProps() {
        return {};
    }
}
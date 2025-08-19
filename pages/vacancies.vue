<script setup>
import useVuelidate from "@vuelidate/core";
import { minLength, sameAs, required } from "@vuelidate/validators";
import { useIMask } from "vue-imask";

const { data } = await useGetData('/pages', {
    params: { url_page: '/vakansii' },
    key: 'vacancies-page-data'
});

const breadcrumbs = ref([]);
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
const aboutPage = ref({});
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

const form = reactive({
    fullname: '',
    phone: '',
    shop_address: '',
    vacancy: '',
    privacy_policy: false,
})
const rules = computed(() => ({
    fullname: {
        required,
        minLength: minLength(2),
    },
    phone: {
        required,
        minLength: minLength(16),
    },
    shop_address: {
        required,
    },
    vacancy: {
        required,
    },
    privacy_policy: {
        required,
        sameAs: sameAs(true),
    },
}))


const v$ = useVuelidate(rules, form)

const { el: phoneInput, masked: maskedPhoneValue } = useIMask({
    mask: '+{7}(000)000-00-00',
});
watch(maskedPhoneValue, (newVal) => {
    form.phone = newVal
})

const { data: vacanciesData } = await useAPI('/vacancies');
const { data: shopsData } = await useAPI('/shops/min');

/**
 * Массив данных вакансий.
 * @type {import('vue').Ref<Array<{
 *   id: number,                     // Уникальный ID вакансии
 *   id_market: number,             // ID рынка/магазина
 *   name: string,                  // Название вакансии
 *   email: string,                 // Контактный email
 *   sort: number,                 // Сортировка
 *   status: number,               // Статус (например, 1 — активна)
 *   info_preview: string,         // Краткое описание вакансии в формате HTML
 *   info_full: string,            // Полное описание вакансии в формате HTML 
 * }>>}
 */
const vacancies = ref(vacanciesData.value?.vacancies || []);
const shops = ref(shopsData.value?.shops || []);


// Фильтруем магазины: оставляем только те, которые связаны с вакансиями (id_market совпадает с id магазина)
const filteredShops = computed(() => {
    // Преобразуем объект магазинов в массив пар [id, адрес], фильтруем по наличию вакансии
    const entriesWithVacancies = Object.entries(shops.value).filter(([shopId]) => {
        return vacancies.value.some(vacancy => String(vacancy.id_market) === shopId)
    })

    // Преобразуем отфильтрованные пары обратно в объект
    return Object.fromEntries(entriesWithVacancies)
})

// Определяем выбранный магазин по совпадению адреса в форме
const selectedShopId = computed(() => {
    // Ищем первую пару [id, адрес], где адрес совпадает с адресом из формы
    const matchedEntry = Object.entries(shops.value).find(([, address]) => {
        return address === form.shop_address
    })

    // Возвращаем id магазина или null, если не найден
    return matchedEntry?.[0] || null
})

// Оставляем вакансии только из выбранного магазина
const filteredVacancies = computed(() => vacancies.value.filter(vacancy => vacancy.id_market == selectedShopId.value))

let selectbox;
onMounted(() => {
    selectbox = new SelectBox('.select-box__js');
    document.addEventListener('keydown', handleEscapeBtn);
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscapeBtn);
})

function handleEscapeBtn(e) {
    if (e.key === 'Escape') {
        selectbox.close();
    }
}

async function formSubmitHandler() {
    // валидируем форму и если данные прошли валидацию, вызываем запрос
    v$.value.$touch();
    if (!v$.value.$invalid) {
        try {
            const response = await useNuxtApp().$apiFetch('/vacancies-form/', {
                method: 'POST',
                body: form,
            });
            if (response.success) {
                useRouter().push('/thanks-vacancy/')
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
    }
}

</script>

<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="block-info">
            <div class="block-info__container container">
                <div class="block-info__content">
                    <div class="block-info__block">
                        <div class="block-info__block-body">
                            <h1 class="block-info__title">{{ aboutPage.headline }}</h1>
                            <div class="block-info__img">
                                <picture>
                                    <img src="~/assets/img/vacancies-page/main-banner.webp" alt="">
                                </picture>
                            </div>
                        </div>
                    </div>
                    <div class="block-info__block">
                        <div class="block-info__block-body">
                            <h2>
                                Работа в народном магазине товаров
                                для дома КУЗЯ!
                            </h2>
                            <p>
                                Хочешь со мной работать? Любишь зарабатывать
                                и открывать новые горизонты. Тогда ты мне сразу нравишься. Быстрей прибегай я запишу
                                тебя в добровольцы. Твой конёк аналитика и ты чертовски внимателен, тогда тебе тоже
                                найдётся местечко в тылу. Шли скорее свои контакты, я сам тебя найду. Если что у меня
                                всё официально со всеми соц. пакетами, пенсионными и страховыми выплатами...
                            </p>
                            <p>
                                Тихо, тихо не шуми так, мест и так мало...
                            </p>
                            <button @click="clickScrollTo('vacancy-form')" class="btn btn-small default-anim bg-yellow"
                                v-anim-hover>
                                Откликнуться
                            </button>

                            <div class="select-box select-box__js select-box--blue no-hidden-li">
                                <div class="select-box__head">
                                    <div class="select-box__label">{{ form.shop_address || 'Адрес магазина' }}</div>
                                </div>
                                <div class="select-box__body">
                                    <div class="select-box__content">
                                        <!-- на клик выставляем новый адрес, сбрасывам выбранную вакансию -->
                                        <ul class="list-style-none select-box__list">
                                            <li @click="form.shop_address = shop, form.vacancy = ''"
                                                v-for="shop in filteredShops" :key="shop" class="select-box-item__js">
                                                <span v-html="shop"></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="vacancies-wrapper">
                                <template v-for="(vacancy, index) in filteredVacancies" :key="index">
                                    <Accordion :title="vacancy.name">
                                        <template v-slot:preview>
                                            <div class="vacancy-preview" v-html="vacancy.info_preview"></div>
                                        </template>
                                        <template v-slot:content>
                                            <div class="vacancy-content-wrapper">
                                                <div class="vacancy-content">
                                                    <div v-html="vacancy.info_full"></div>
                                                    <template v-if="vacancy.email">
                                                        <p><b>Контакты:</b></p>
                                                        <p v-if="vacancy.email">почта: <b>{{ vacancy.email }}</b></p>
                                                    </template>
                                                </div>
                                                <button @click="clickScrollTo('vacancy-form'), form.vacancy = vacancy.name"
                                                    class="btn btn-small default-anim bg-yellow" v-anim-hover>
                                                    Откликнуться
                                                </button>
                                            </div>
                                        </template>
                                    </Accordion>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <form @submit.prevent="formSubmitHandler" id="vacancy-form" class="vacancy-form">
            <picture>
                <source media="screen and (orientation: portrait)"
                    srcset="~/assets/img/vacancies-page/smiling-craftsman-mob.webp">
                <img src="~/assets/img/vacancies-page/smiling-craftsman.webp">
            </picture>
            <div class="vacancy-form-container">
                <div class="vacancy-form__info-container">
                    <h2>Оставьте заявку — <br>
                        мы с вами свяжемся</h2>
                    <p>Оставьте свой номер и мы вам перезвоним</p>
                </div>
                <div class="vacancy-form__inputs-wrapper">

                    <div class="form-item input" :class="{
                        'has-success': (!v$.fullname.$error && !v$.fullname.required.$invalid && !v$.fullname.minLength.$invalid),
                        'has-error': (v$.fullname.$error) || (v$.fullname.minLength.$invalid)
                    }">
                        <label for="" class="form-label">ФИО *</label>
                        <div class="form-item__body">
                            <input type="text" name="name" class="form-input" v-model.trim="form.fullname" data-min="2"
                                data-max="32" maxlength="32" placeholder="Ваше имя">
                            <div class="helper-block" v-if="v$.fullname.minLength.$invalid">
                                Минимальное количетсво символов 2
                            </div>
                            <div class="helper-block" v-if="(v$.fullname.$error && v$.fullname.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>

                    <div class="form-item input" :class="{
                        'has-success': (!v$.phone.$error && !v$.phone.required.$invalid && !v$.phone.minLength.$invalid),
                        'has-error': (v$.phone.$error) || (v$.phone.minLength.$invalid)
                    }">
                        <label for="vacancy-phone-input" class="form-label">Телефон *</label>
                        <div class="form-item__body">
                            <input ref="phoneInput" id="vacancy-phone-input" type="text" name="phone" class="form-input"
                                inputmode="tel" data-min="16" data-max="16" maxlength="16"
                                placeholder="+7_">
                            <div class="helper-block" v-if="v$.phone.minLength.$invalid">
                                Минимальное количетсво символов 2
                            </div>
                            <div class="helper-block" v-if="(v$.phone.$error && v$.phone.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>
                    <div class="form-item form-select form-select--first">
                        <label for="vacancy-phone-input" class="form-label">Адрес магазина *</label>
                        <div class="form-item select-box select-box--form select-box__js no-hidden-li">
                            <input type="text" class="hidden select-box-input-hidden" v-model="form.shop_address">
                            <div class="select-box__head">
                                <div class="select-box__label"
                                    :class="{ 'select-box__label-black-text': form.shop_address }">
                                    {{ form.shop_address || 'Выберите магазин' }}
                                </div>
                            </div>
                            <div class="select-box__body">
                                <div class="select-box__content">
                                    <ul class="list-style-none select-box__list">
                                        <template v-for="item in filteredShops">
                                            <!-- на клик выставляем новый адрес, сбрасывам выбранную вакансию -->
                                            <li class="select-box-item__js"
                                                @click="form.shop_address = item, form.vacancy = ''"><span>{{
                                                    item }}</span></li>
                                        </template>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-item form-select">
                        <label for="vacancy-phone-input" class="form-label">Вакансия *</label>
                        <div class="form-item select-box select-box--form select-box__js no-hidden-li">
                            <input type="text" class="hidden select-box-input-hidden" v-model="form.filteredVacancies">
                            <div class="select-box__head">
                                <div class="select-box__label"
                                    :class="{ 'select-box__label-black-text': form.vacancy }">
                                    {{ form.vacancy || 'Желаемая вакансия' }}
                                </div>
                            </div>
                            <div class="select-box__body">
                                <div class="select-box__content">
                                    <ul class="list-style-none select-box__list">
                                        <template v-if="filteredVacancies.length <= 0">
                                            <div>
                                                <li><span>Выберите магазин</span></li>
                                            </div>
                                        </template>
                                        <template v-else v-for="item in filteredVacancies">
                                            <li class="select-box-item__js" @click="form.vacancy = item.name">
                                                <span>
                                                    {{ item.name }}
                                                </span>
                                            </li>
                                        </template>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="vacancy-form__action">
                    <button type="submit" class="btn btn-small default-anim bg-yellow" v-anim-hover>
                        Откликнуться
                    </button>
                    <div class="checkbox-house form-checkboxes">
                        <div class="form-item" :class="{ '_checked': form.privacy_policy }">
                            <input type="checkbox" id="vacancy-question_privacy_policy" v-model="form.privacy_policy"
                                class="form-checkbox">
                            <label for="vacancy-question_privacy_policy" class="form-check-label form-politics">Я даю
                                согласие на
                                обработку персональных
                                данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
                                    конфиденциальности</router-link>,
                                и соглашаюсь с <router-link to="/oferta/" target="_blank">Офертой</router-link>.</label>
                            <div class="helper-block"
                                v-if="v$.privacy_policy.sameAs.$invalid && v$.privacy_policy.$error">
                                Обязательно
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped lang="scss">
.block-info__block-body {
    z-index: 2;

    >h2 {
        line-height: 1;
    }

    >p:last-of-type {
        margin-bottom: 5rem;
    }

    >.btn {
        margin-bottom: 6.8rem;
    }

    >.select-box {
        margin-bottom: 4rem;
    }
}

.vacancies-wrapper {
    display: flex;
    flex-flow: column;
    gap: 1.6rem;
}

.vacancy-preview {
    >:last-child {
        margin-bottom: 0;
    }
}

.vacancy-form {
    position: relative;
    margin-bottom: 18rem;

    picture {
        img {
            aspect-ratio: 1440 / 780;
            width: 100%;
            height: auto;

            @media screen and (orientation: portrait) {
                aspect-ratio: 414 / 780;
            }
        }
    }

    .form-select {
        z-index: 3;

        // ставим первый селектбокс выше других
        &.form-select--first {
            z-index: 4;
        }
    }
}

.vacancy-form-container {
    width: 68.6rem;
    height: 68.4rem;
    background-color: var(--grey);
    border-radius: 6rem;
    padding: 6rem;


    position: absolute;
    inset: 4.8rem 10rem 4.8rem auto;

    display: flex;
    flex-flow: column;
    gap: 2.4rem;

    @media screen and (orientation: portrait) {
        padding: 4rem 2rem;
        inset: 5.2rem 1.6rem;
        width: 38.2rem;
        height: max-content;
        border-radius: 3.2rem;
    }
}

.vacancy-form__info-container {
    h2 {
        margin: 0 0 2rem 0;
        line-height: 1.2;
    }

    >:last-child {
        margin-bottom: 0;
    }

    @media screen and (orientation: portrait) {
        >* {
            text-align: center;
        }
    }
}

.vacancy-form__action {
    display: flex;
    gap: 2rem;

    .btn {
        flex-shrink: 0;
    }

    @media screen and (orientation: portrait) {
        flex-flow: column-reverse;
        gap: 4rem;
        align-items: center;

        .form-politics {
            text-align: left;
        }
    }
}
</style>
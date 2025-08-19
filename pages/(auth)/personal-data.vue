<script>
import useVuelidate from '@vuelidate/core';
import { email, minLength, required } from '@vuelidate/validators';
import { mapState } from 'pinia';
import { useIMask } from 'vue-imask';

export default {
    setup() {
        const { el: phoneInput, masked: maskedPhoneValue } = useIMask({
            mask: '+{7}(000)000-00-00',
        });
        return {
            v$: useVuelidate(),
            phoneInput,
            maskedPhoneValue
        }
    },
    data() {
        return {
            breadcrumbs: {},
            aboutPage: {},
            form: {
                name: '',
                surname: '',
                phone: '',
                email: '',
                dateBirth: '',
                weddingDay: '',
                childrenUnderEighteen: '',
                gender: '',
                image: '',
                mailSubscribe: false,
            },
            changePassForm: {
                oldPass: '',
                newPass: '',
            },
            isSaved: true,
            isDataLoaded: false,
            selectbox: null,
            childrenNumbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            fileReaderSrc: null,
        }
    },
    validations() {
        return {
            form: {
                name: {
                    required,
                    minLength: minLength(2)
                },
                surname: {
                    required,
                    minLength: minLength(2)
                },
                phone: {
                    required,
                    minLength: minLength(16)
                },
                email: {
                    required,
                    email,
                },
            },
            changePassForm: {
                newPass: {
                    minLength: minLength(6)
                }
            }
        }
    },
    methods: {
        handleSavePassClick() {
            this.$refs.changePass.close();
        },
        selectChildrenUnderEighteen(childrenUnderEighteen) {
            this.form.childrenUnderEighteen = childrenUnderEighteen;
        },
        weddingDay() {
            const context = this;
            const $calendar = selectElement('.vanilla-calendar.wedding-vanilla-calendar');
            let today = new Date();

            if ($calendar) {
                const calendarInfoDate = $calendar.parentElement.querySelector('.vanilla-calendar__input');

                const calendar = new VanillaCalendar($calendar, {
                    settings: {
                        lang: 'ru',
                        iso8601: true,
                        visibility: {
                            weekend: false,
                        },
                        range: {
                            min: (today.getFullYear() - 80) + '-01-01',
                            max: today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'),
                            // values: ['2023-02-16', '2022-02-17'],
                        },
                    },
                    actions: {
                        clickDay(e, dates) {
                            let currentDate = new Date(dates[0]);
                            if (currentDate.getDate()) {
                                context.form.weddingDay = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`
                            } else {
                                context.form.weddingDay = ''
                            }
                            $calendar.classList.remove('_active');
                        },
                        clickArrow(e, year, month) {
                            let $this = e.target;
                            if ($this.classList.contains('vanilla-calendar-arrow_prev')) {
                                $this.nextElementSibling.classList.remove('hide');
                            }
                            if ($this.getAttribute('style') === 'visibility: hidden;') {
                                $this.classList.add('hide');
                            }
                        },
                    },
                    DOMTemplates: CalendarDOMTemplate,
                });
                calendar.init();

                if (calendarInfoDate) {
                    calendarInfoDate.addEventListener('click', () => {
                        $calendar.classList.toggle('_active');
                    });
                }
            }
        },
        dateBirth() {
            const context = this;
            const $calendar = selectElement('.vanilla-calendar.birth-vanilla-calendar');

            let today = new Date();

            if ($calendar) {
                const calendarInfoDate = $calendar.parentElement.querySelector('.vanilla-calendar__input');

                const calendar = new VanillaCalendar($calendar, {
                    settings: {
                        lang: 'ru',
                        iso8601: true,
                        visibility: {
                            weekend: false,
                        },
                        range: {
                            min: (today.getFullYear() - 100) + '-01-01',
                            max: today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'),
                            // values: ['2023-02-16', '2022-02-17'],
                        },
                    },
                    actions: {
                        clickDay(e, dates) {
                            let currentDate = new Date(dates[0]);
                            if (currentDate.getDate()) {
                                context.form.dateBirth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`
                            } else {
                                context.form.dateBirth = '';
                            }
                            $calendar.classList.remove('_active');
                        },
                        clickArrow(e, year, month) {
                            let $this = e.target;
                            if ($this.classList.contains('vanilla-calendar-arrow_prev')) {
                                $this.nextElementSibling.classList.remove('hide');
                            }
                            if ($this.getAttribute('style') === 'visibility: hidden;') {
                                $this.classList.add('hide');
                            }
                        },
                    },
                    DOMTemplates: CalendarDOMTemplate,
                });

                calendar.init();

                if (calendarInfoDate) {
                    calendarInfoDate.addEventListener('click', () => {
                        $calendar.classList.toggle('_active');
                    });
                }
            }
        },
        initMeta() {
            definePageMeta({
                middleware: 'auth'
            })
            useRobotsRule({ noindex: true, nofollow: true })
            useSeoMeta({ title: 'Личные данные' })
            this.breadcrumbs = [{ ['Личные данные']: '' }]
            this.aboutPage = {
                headline: 'Личные данные',
            }
        },
        fileInput() {
            const fileInput = this.$refs.fileInput;
            const context = this;

            function onFileChange() {
                const file = fileInput.files[0];

                if (file && file.type.startsWith('image/')) {  // Проверяем, что файл является изображением
                    const reader = new FileReader();

                    reader.onload = function (event) {
                        context.fileReaderSrc = event.target.result;
                    };

                    reader.readAsDataURL(file);
                } else {
                    alert('Пожалуйста, загрузите изображение.');
                    fileInput.value = '';  // Сбросить выбор файла
                }
            }

            fileInput.addEventListener('change', onFileChange);
        },
        setUserData() {
            this.form.name = this.userData.name || '';
            this.form.surname = this.userData.surname || '';
            this.form.email = this.userData.email || '';
            this.maskedPhoneValue = this.userData.phone || '';
            this.form.gender = this.userData.gender === 1 ? 'man' : 'woman';
            this.form.dateBirth = this.userData.date_of_birth;
            this.form.weddingDay = this.userData.date_of_wedding;
            this.form.childrenUnderEighteen = this.userData.children_count;
            this.form.image = this.userData.image;

            this.$nextTick(() => {
                this.isDataLoaded = true;
            });
        },
        async saveDataUser() {
            if (!useAuthStore().isAuthenticated) {
                this.$router.push('/');
                return;
            }
            this.$refs.loadingScreen.show();
            this.v$.$touch();

            if (this.v$.form.$invalid || this.v$.changePassForm.$invalid) {
                return false;
            }

            let formData = new FormData();
            formData.append('name', this.form.name);
            formData.append('surname', this.form.surname);
            formData.append('phone', this.form.phone);
            formData.append('email', this.form.email);
            formData.append('gender', this.form.gender);
            formData.append('date_of_birth', this.form.dateBirth ? this.form.dateBirth : '');
            formData.append('date_of_wedding', this.form.weddingDay ? this.form.weddingDay : '');
            formData.append('children_count', this.form.childrenUnderEighteen ? this.form.childrenUnderEighteen : '');
            formData.append('mail_subscribe', this.form.mailSubscribe);
            if (this.changePassForm.oldPass && this.changePassForm.newPass) {
                formData.append('old_password', this.changePassForm.oldPass);
                formData.append('new_password', this.changePassForm.newPass);
            }
            let file = this.$refs.fileInput.files[0];
            if (file) {
                formData.append('file', file);
            }

            try {
                const response = await useNuxtApp().$apiFetch('/user-update', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    }
                });
                if (response.success) {
                    this.$refs.loadingScreen.success('Успешное обновление')
                    this.isSaved = true;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
                this.$refs.loadingScreen.error('Ошибка обновления' + error.message)
            }

        },
        handleEscapeBtn(e) {
            if (e.key === 'Escape') {
                this.selectbox.close();
            }
        },
        init() {
            useGetUserData(this.setUserData);

            this.$nextTick(() => {
                this.dateBirth()
                this.weddingDay()
                this.initMeta();
                this.fileInput();
                this.selectbox = new SelectBox('.select-box__js');
                document.addEventListener('keydown', this.handleEscapeBtn);
            });
        },
    },
    beforeRouteLeave(to, from, next) {
        if (!this.isSaved) {
            useConfirmPopup()('Вы уверены, что хотите покинуть страницу? Данные не сохранены.').then((ques) => {
                if (ques) {
                    next();
                } else {
                    next(false); // Отменяем переход
                }
            });
        } else {
            next();
        }
    },
    mounted() {
        this.init();
    },
    unmounted() {
        document.removeEventListener('keydown', this.handleEscapeBtn);
    },
    computed: {
        ...mapState(useAuthStore, ['userData']),
        srcImg() {
            return this.fileReaderSrc ? this.fileReaderSrc : this.form.image ? `${useRuntimeConfig().public.imgBaseURL}/storage/uploads/users/${this.form.image}` : '';
        }
    },
    watch: {
        form: {
            handler(newValue, oldValue) {
                if (this.isDataLoaded && Object.keys(newValue) !== Object.keys(oldValue)) {
                    this.isSaved = false;
                }
            },
            deep: true
        },
        maskedPhoneValue(newVal) {
            this.form.phone = newVal
        },
    }
}
</script>
<template>
    <LoadingScreen ref="loadingScreen"></LoadingScreen>
    <ClientOnly>
        <main class="main">
            <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
            <section class="personal-data container">
                <h1 v-html="aboutPage.headline"></h1>
                <form class="personal-data-form">
                    <div class="main-data-wrapper">
                        <div class="inputs-container">
                            <div class="inputs-container__item form-item input"
                                :class="{ 'has-success': (!v$.form.name.$error && !v$.form.name.required.$invalid && !v$.form.name.minLength.$invalid), 'has-error': (v$.form.name.$error) || (v$.form.name.minLength.$invalid) }">
                                <label for="" class="form-label">Имя *</label>
                                <div class="form-item__body">
                                    <input type="text" class="form-input" v-model.trim="form.name">
                                    <div class="helper-block" v-if="v$.form.name.minLength.$invalid">
                                        Минимальное количество символов 2
                                    </div>
                                    <div class="helper-block"
                                        v-if="(v$.form.name.$error && v$.form.name.required.$invalid)">
                                        Это обязательное поле для заполнения
                                    </div>
                                </div>
                            </div>
                            <div class="inputs-container__item form-item input"
                                :class="{ 'has-success': (!v$.form.surname.$error && !v$.form.surname.required.$invalid && !v$.form.surname.minLength.$invalid), 'has-error': (v$.form.surname.$error) || (v$.form.surname.minLength.$invalid) }">
                                <label for="" class="form-label">Фамилия *</label>
                                <div class="form-item__body">
                                    <input type="text" class="form-input" v-model.trim="form.surname">
                                    <div class="helper-block" v-if="v$.form.surname.minLength.$invalid">
                                        Минимальное количество символов 2
                                    </div>
                                    <div class="helper-block"
                                        v-if="(v$.form.surname.$error && v$.form.surname.required.$invalid)">
                                        Это обязательное поле для заполнения
                                    </div>
                                </div>
                            </div>
                            <div class="inputs-container__item form-item input"
                                :class="{ 'has-success': (!v$.form.phone.$error && !v$.form.phone.required.$invalid && !v$.form.phone.minLength.$invalid), 'has-error': (v$.form.phone.$error) || (v$.form.phone.minLength.$invalid) }">
                                <label for="" class="form-label">Телефон *</label>
                                <div class="form-item__body">
                                    <input ref="phoneInput" type="text" class="form-input" inputmode="tel"
                                        placeholder="+7_" data-tel-input data-min="16" data-max="16" maxlength="16">
                                    <div class="helper-block" v-if="v$.form.phone.minLength.$invalid">
                                        Минимальное количество символов 16
                                    </div>
                                    <div class="helper-block"
                                        v-if="(v$.form.phone.$error && v$.form.phone.required.$invalid)">
                                        Это обязательное поле для заполнения
                                    </div>
                                </div>
                            </div>
                            <div class="inputs-container__item form-item input"
                                :class="{ 'has-success': (!v$.form.email.$error && !v$.form.email.required.$invalid && !v$.form.email.email.$invalid), 'has-error': (v$.form.email.$error) || (v$.form.email.email.$invalid && !v$.form.email.required.$invalid) }">
                                <label for="" class="form-label">E-mail *</label>
                                <div class="form-item__body">
                                    <input type="text" v-model.trim="form.email" class="form-input" autocapitalize="off"
                                        autocorrect="off" autocomplete="email" inputmode="email">
                                    <div class="helper-block"
                                        v-if="(v$.form.email.$error && form.email.length !== 0) || (v$.form.email.required.$invalid && v$.form.email.email.$invalid)">
                                        Email введен не корректно
                                    </div>
                                    <div class="helper-block"
                                        v-if="(v$.form.email.$error && v$.form.email.required.$invalid)">
                                        Это обязательное поле для заполнения
                                    </div>
                                </div>
                            </div>
                        </div>
                        <label class="avatar-container" ref_for="fileInput">
                            <input type="file" class="hidden" ref="fileInput" name="fileInput">
                            <img v-if="srcImg" class="avatar-icon-img" :src="srcImg" alt="avatar" ref="image">
                            <template v-else>
                                <svg class="avatar-icon" width="164" height="164" viewBox="0 0 164 164" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <rect width="164" height="164" rx="82" fill="#F0F4FC" />
                                    <mask id="mask0_1410_9" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0"
                                        y="0" width="164" height="164">
                                        <rect width="164" height="164" rx="82" fill="#0D111A" />
                                    </mask>
                                    <g mask="url(#mask0_1410_9)">
                                        <rect width="164" height="164" fill="#F6F6F6" />
                                        <path
                                            d="M164 159.655V169.647C163.801 171.875 163.668 174.125 163.359 176.353C163.226 177.257 162.717 178.118 162.386 179H0.258473C-0.0510988 178.272 -0.626018 177.566 -0.648131 176.816C-0.825029 170.596 -1.1346 164.375 -0.93559 158.177C-0.780804 153.743 1.27564 150.125 4.92417 147.214C14.7641 139.427 25.7761 134.067 37.8051 130.648C43.5322 129.016 49.2372 127.295 54.9422 125.552C57.9052 124.648 59.8953 122.861 60.3155 119.619C60.4481 118.626 60.7577 117.633 61.0452 116.663C61.5095 115.119 61.0894 113.994 59.8953 112.825C55.2296 108.258 51.758 103.053 51.1389 96.2807C50.8735 93.4793 50.1217 90.6779 49.2814 87.9867C48.9276 86.8397 47.7778 85.8912 46.9375 84.8986C46.0751 83.8839 44.9474 83.0677 44.2619 81.9427C43.3553 80.5089 42.5814 78.9207 42.0949 77.2884C40.9893 73.6046 39.8837 69.8988 39.2203 66.1268C38.7339 63.4357 39.353 60.8548 42.4929 59.7078C42.891 59.5534 43.2227 58.7152 43.2448 58.1857C43.3332 56.4652 43.2227 54.7446 43.2669 53.0461C43.6428 42.4581 47.1144 32.995 53.9913 24.8775C57.7062 20.4878 62.3498 17.2011 68.1874 16.7379C72.7647 16.3629 77.1429 15.3923 81.6096 14.5541C89.8575 13.01 97.442 14.6423 103.987 20.0908C108.41 23.7745 111.572 28.4068 113.938 33.5905C117.409 41.1787 119.665 49.0756 119.156 57.546C119.112 58.296 118.869 59.1784 119.974 59.5534C121.898 60.1931 122.827 61.7372 122.96 63.5901C123.535 71.5091 120.969 78.4795 115.817 84.4133C114.557 85.8691 113.385 87.2147 112.965 89.1117C112.633 90.6338 112.213 92.1337 111.992 93.6778C111.306 98.3763 110.422 103.009 107.459 106.913C105.845 109.053 104.031 111.06 102.439 113.2C101.931 113.883 101.533 114.92 101.599 115.736C101.732 117.258 102.285 118.758 102.594 120.28C102.97 122.288 104.142 123.655 105.955 124.516C106.972 125.001 107.99 125.486 109.073 125.817C113.982 127.361 118.913 128.905 123.866 130.317C136.713 134.001 148.61 139.515 158.892 148.228C160.772 149.817 162.12 151.692 162.717 154.03C163.204 155.883 163.558 157.758 163.978 159.633L164 159.655Z"
                                            fill="#EBEBEB" />
                                    </g>
                                </svg>
                                <p class="avatar-text">Добавить<br>фото</p>
                            </template>
                            <svg class="badge-edit avatar__edit-badge" width="46" height="46" viewBox="0 0 46 46"
                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.332031" y="0.284851" width="44.7273" height="44.7273" rx="22.3636"
                                    fill="#0078BE" />
                                <path d="M22.6958 27.9818H28.6958" stroke="white" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path
                                    d="M25.6958 16.9818C25.961 16.7166 26.3207 16.5676 26.6958 16.5676C26.8815 16.5676 27.0654 16.6042 27.237 16.6753C27.4086 16.7463 27.5645 16.8505 27.6958 16.9818C27.8271 17.1132 27.9313 17.2691 28.0024 17.4406C28.0734 17.6122 28.11 17.7961 28.11 17.9818C28.11 18.1676 28.0734 18.3515 28.0024 18.523C27.9313 18.6946 27.8271 18.8505 27.6958 18.9818L19.3625 27.3152L16.6958 27.9818L17.3625 25.3152L25.6958 16.9818Z"
                                    stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </label>
                    </div>
                    <div class="btn-border default-anim btn-border-240" v-anim-hover
                        @click="$refs.changePass.showModal()">
                        Поменять пароль</div>

                    <div class="genderRadioContainer form-radiobtns custom">
                        <p class="genderRadio__text">Пол:</p>
                        <div class="radioContainer" :class="{ '_checked': form.gender == 'man' }">
                            <input type="radio" class="radio form-radiobtn" name="genderRadio" id="menRadio"
                                :checked="form.gender == 'man'" value="man" v-model="form.gender">
                            <label for="menRadio" class="form-check-label">м</label>
                        </div>
                        <div class="radioContainer" :class="{ '_checked': form.gender == 'woman' }">
                            <input type="radio" class="radio form-radiobtn" name="genderRadio" id="womenRadio"
                                :checked="form.gender == 'woman'" value="woman" v-model="form.gender">
                            <label for="womenRadio" class="form-check-label">ж</label>
                        </div>
                    </div>

                    <div class="input-wrapper calendar birth-calendar">
                        <p class="input-title">Дата рождения</p>
                        <p class="input-text">Предоставим персональную скидку от магазина в День рождения</p>
                        <div class="form-item__body select-box__small">
                            <input type="text" id="birthDateInput"
                                class="vanilla-calendar__input make-order-form__input form-input" readonly
                                v-model="form.dateBirth" placeholder="1990-05-23">
                            <div class="vanilla-calendar birth-vanilla-calendar">
                            </div>
                        </div>
                    </div>

                    <div class="input-wrapper calendar">
                        <p class="input-title">Дата свадьбы</p>
                        <p class="input-text">Подарок от наших партнеров для молодоженов</p>
                        <div class="form-item__body select-box__small">
                            <input type="text" id="weddingDayInput"
                                class="vanilla-calendar__input make-order-form__input form-input" readonly
                                v-model="form.weddingDay" placeholder="1990-05-23">
                            <div class="vanilla-calendar wedding-vanilla-calendar">
                            </div>
                        </div>
                    </div>

                    <div class="input-wrapper">
                        <p class="input-title">Количество детей до 18 лет</p>
                        <p class="input-text">Акции и подарки для детей до 18 лет</p>
                        <div class="select-box__small form-item select-box select-box__js no-hidden-li">
                            <input type="text" class="hidden select-box-input-hidden"
                                v-model="form.childrenUnderEighteen">
                            <div class="select-box__head" @click="toggleSelectTime">
                                <div class="select-box__label"
                                    :class="{ 'select-box__label-black-text': form.childrenUnderEighteen }">
                                    {{ form.childrenUnderEighteen ? form.childrenUnderEighteen : '0' }}
                                </div>
                            </div>
                            <div class="select-box__body">
                                <div class="select-box__content">
                                    <ul class="list-style-none select-box__list">
                                        <template v-for="item in childrenNumbers">
                                            <li @click="selectChildrenUnderEighteen(item)"><span>{{ item }}</span></li>
                                        </template>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="checkbox-house form-checkboxes">
                        <div class="form-item" :class="{ '_checked': form.mailSubscribe }">
                            <input type="checkbox" id="mailSubscribe" v-model="form.mailSubscribe"
                                class="form-checkbox">
                            <label for="mailSubscribe" class="form-check-label">Подписка на скидки и новости</label>
                        </div>
                    </div>
                    <div @click="saveDataUser()" class="sticky btn-border default-anim btn-border-240" v-anim-hover>
                        Сохранить
                        изменения</div>
                </form>
            </section>
            <info-actions-form class="mt-142"></info-actions-form>
            <dialog class="changePass" ref="changePass">
                <svg @click="$refs.changePass.close();" class="closeSVG" xmlns="http://www.w3.org/2000/svg" width="4rem"
                    height="4rem" viewBox="0 0 24 24">
                    <path fill="currentColor"
                        d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
                </svg>
                <form class="inputs-container">
                    <div class="inputs-container__item form-item input">
                        <div class="form-item__body">
                            <label for="" class="form-label">Старый пароль</label>
                            <PassInputTemplate>
                                <input class="form-input" type="password" v-model="changePassForm.oldPass">
                            </PassInputTemplate>
                        </div>
                    </div>
                    <div class="inputs-container__item form-item input">
                        <div class="form-item__body">
                            <label for="" class="form-label">Новый пароль</label>
                            <PassInputTemplate>
                                <div class="helper-block" v-if="v$.changePassForm.newPass.minLength.$invalid">
                                    Минимальное количество символов 6
                                </div>
                                <input class="form-input" type="password" v-model="changePassForm.newPass">
                            </PassInputTemplate>
                        </div>
                    </div>
                    <div class="btn-border default-anim btn-border-240" v-anim-hover @click="handleSavePassClick">
                        Сохранить
                    </div>
                </form>
            </dialog>
        </main>
    </ClientOnly>
</template>
<style scoped>
.sticky {
    z-index: 10;
    position: sticky;
    bottom: 1rem;
    background-color: var(--white);
    align-self: end;
}

@media only screen and (orientation: portrait) {
    .sticky {
        bottom: 8rem;
    }
}
</style>

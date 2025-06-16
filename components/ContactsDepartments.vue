<script>
export default {
    async setup() {
        const { data } = await useGetData('/contacts', {
            key: 'contacts-departments-data',
        });
        const staff = ref(data.value?.employees || []);
        const departments = ref(data.value?.departments || []);

        return {
            staff,
            departments,
        };
    },
    data() {
      return {
          selectedDepartaments: 'filter-2',
          isActiveSelect: false,
      }
    },
    inject: [
        'configs'
    ],
    methods: {
        getNameDepartament() {
            let {name} = this.departments.find(item => item.filter === this.selectedDepartaments)
            return name;
        },
        toggleSelect() {
            this.isActiveSelect = !this.isActiveSelect;
        },
        toggleDepartament(filter){
            this.selectedDepartaments = filter;
        }
    },
}

</script>

<template>
    <section class="contacts-departments">
        <div class="contacts-departments__container container">
            <div class="contacts-departments__content">
                <div class="contacts-departments__block anim-item" v-anim-scroll>
                    <div class="contacts-departments__block-body sticky-body">
                        <div class="contacts-departments__list">
                            <div v-for="(person, indx) in staff" :key="'staff'+indx"
                                 class="contacts-departments-item contacts-departments-item__js" :class="[person.filter, selectedDepartaments === person.filter ? '' : 'hidden']">
                                <div class="contacts-departments-item__block">
                                    <div class="contacts-departments-item__img">
                                        <picture>
                                            <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/${person.img}`" alt="">
                                        </picture>
                                    </div>
                                </div>
                                <div class="contacts-departments-item__block">
                                    <div class="contacts-departments-item__name" v-html="person.name">
                                    </div>
                                    <div class="contacts-departments-item__text" v-html="person.profession">
                                    </div>
                                    <div class="contacts-departments-item__tels">
                                        <div class="contacts-departments-item__tel">
                                            <a :href="'tel:'+person.phone">+{{ person.phone }}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="contacts-departments__block sticky styky__js anim-item" v-anim-scroll>
                    <div class="contacts-departments__block-body sticky-body">
                        <div class="contacts-departments-items">
                            <div
                                class="contacts-departments-items__btn-select btn-select btn-select__js select-departaments__js" :class="{'_active': isActiveSelect}">
                                <div class="btn-select__head" @click="toggleSelect">
                                    <div v-if="departments && departments.length" class="btn-select__label">{{ getNameDepartament() }}</div>
                                </div>
                                <div class="btn-select__body">
                                    <div class="btn-select__content">
                                        <div v-for="(departament, indx) in departments" :key="'departament'+indx" class="contacts-departments-items__item select-departament__js btn-select__item" :class="[selectedDepartaments === departament.filter ? '_active' : '']" @click="toggleDepartament(departament.filter)"
                                            :data-filter="departament.filter">
                                            {{departament.name}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="contacts-departments__btns">
                <a :href="`${useRuntimeConfig().public.imgBaseURL}/storage/${configs['CONTACT_PDF']}`" target="_blank" class="contacts-departments__btn btn-border default-anim">
                    <svg class="pdf" width="30" height="30" viewBox="0 0 30 30" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15 13.127H16.25V16.877H15V13.127ZM8.75 14.377H10V13.127H8.75V14.377ZM25 7.50195V22.502C25 23.165 24.7366 23.8009 24.2678 24.2697C23.7989 24.7386 23.163 25.002 22.5 25.002H7.5C6.83696 25.002 6.20107 24.7386 5.73223 24.2697C5.26339 23.8009 5 23.165 5 22.502V7.50195C5 6.83891 5.26339 6.20303 5.73223 5.73419C6.20107 5.26535 6.83696 5.00195 7.5 5.00195H22.5C23.163 5.00195 23.7989 5.26535 24.2678 5.73419C24.7366 6.20303 25 6.83891 25 7.50195ZM11.875 13.127C11.875 12.6297 11.6775 12.1528 11.3258 11.8011C10.9742 11.4495 10.4973 11.252 10 11.252H6.875V18.752H8.75V16.252H10C10.4973 16.252 10.9742 16.0544 11.3258 15.7028C11.6775 15.3511 11.875 14.8742 11.875 14.377V13.127ZM18.125 13.127C18.125 12.6297 17.9275 12.1528 17.5758 11.8011C17.2242 11.4495 16.7473 11.252 16.25 11.252H13.125V18.752H16.25C16.7473 18.752 17.2242 18.5544 17.5758 18.2028C17.9275 17.8511 18.125 17.3742 18.125 16.877V13.127ZM23.125 11.252H19.375V18.752H21.25V16.252H23.125V14.377H21.25V13.127H23.125V11.252Z"
                            fill="#0078BE"/>
                    </svg>

                    <span>Реквизиты</span>
                    <svg class="arrow" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 19.3252L17.3507 6.97666" stroke="#0078BE" stroke-width="2.3" stroke-linecap="round"
                              stroke-linejoin="round"/>
                        <path d="M6.82617 6.34033H18.2751V17.7883" stroke="#0078BE" stroke-width="2.3"
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>

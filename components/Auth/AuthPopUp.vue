<script>
import { mapState } from 'pinia';

export default {
    data() {
        return {
            formType: 'signIn',
            activeToken: false,
        }
    },
    inject: [
        "openPopUpMenu",
    ],
    methods: {
        open() {
            if (this.isAuthenticated) {
                this.openPopUpMenu('person')
            } else {
                this.formType = 'signIn'
                this.$refs.authPopUp.show();
            }
        },
        close() {
            this.$refs.authPopUp.close();
        },
        changeFormType(newType) {
            this.formType = newType;
        },
        handleSignUpFormDataUpdate(updatedData) {
            this.signUpFormData = updatedData;
        },
        handleSignInFormDataUpdate(updatedData) {
            this.signInFormData = updatedData;
        },
    },
    computed: {
        ...mapState(useAuthStore, ['token', 'isAuthenticated']),
    },
}
</script>
<template>
    <dialog class="auth-popUp h100vh" ref="authPopUp">
        <div class="auth-popUp__container">
            <div class="popup__close default-anim auth-popUp__close" v-anim-hover @click="$refs.authPopUp.close()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>

            <img src="~/assets/img/AuthBanner.jpg" alt="" class="left-col-image">

            <signInForm v-if="formType === 'signIn'" @changeFormType="changeFormType"></signInForm>

            <signUpForm v-if="formType === 'signUp'" @changeFormType="changeFormType"></signUpForm>

            <forgotPassForm v-if="formType === 'forgotPass'" @changeFormType="changeFormType"></forgotPassForm>
        </div>
    </dialog>
</template>
<style scoped></style>

<script setup>
import { ref, watch } from 'vue';
const passOpened = ref(false);
const passwordEye = ref(null);

watch(passOpened, (newState) => {
    const passwordInput = passwordEye.value.parentElement.querySelector('input');
    if (newState == true) {
        passwordInput.type = 'text'
    } else {
        passwordInput.type = 'password'
    }
})
</script>

<template>
    <div class="password-input">
        <slot></slot>
        <div class="password-eye" ref="passwordEye" @click="passOpened = !passOpened" :class="{'opened' : passOpened}"></div>
    </div>
</template>


<style></style>
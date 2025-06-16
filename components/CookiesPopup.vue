<script setup>
const cookiesAccepted = ref(false);

onMounted(() => {
    cookiesAccepted.value = checkCookies();
});

function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    for (const [key, val] of Object.entries(options)) {
        updatedCookie += `; ${key}`;
        if (val !== true) {
            updatedCookie += `=${val}`;
        }
    }

    document.cookie = updatedCookie;
}

function checkCookies() {
    return document.cookie.split('; ').some(cookie => cookie.startsWith('cookieConsent=on'));
}

function acceptCookies() {
    setCookie('cookieConsent', 'on', { secure: true, 'max-age': 2592000 });
    cookiesAccepted.value = true;
}
</script>
<template>
    <div v-if="!cookiesAccepted" class="cookies-warn">
        <div class="cookies-warn__container">
            <div class="cookies-warn__text">
                <img class="cookie-img" src="~/assets/img/cookie.png" alt="cookie image">
                <p>Мы используем cookies для удобной работы сайта. Продолжая использовать наш сайт, вы соглашаетесь на
                    использование cookies в соответствии с нашей <router-link to="/politics/" target="_blank">Политикой
                        конфиденциальности</router-link>
                </p>
            </div>
            <button class="btn cookies-warn__button default-anim bg-yellow" v-anim-hover
                @click="acceptCookies">Хорошо</button>
        </div>
    </div>
</template>
<style scoped>
/* попап о предупреждении о куках */
.cookies-warn {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;

    display: block;

    z-index: 110;
}

.cookies-warn__container {
    width: 48rem;
    height: fit-content;
    background: var(--blue);
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 2rem;

    padding: 2.4rem 1.6rem;
    border-radius: 1.6rem;

    position: absolute;
    right: 4rem;
    bottom: 2rem;
    pointer-events: all;
}

.cookies-warn__text {
    display: flex;
    flex-flow: column;
    gap: .8rem;
}

.cookies-warn__text p {
    color: var(--white);
    margin-bottom: 0;
    font-size: 1.6rem;
    line-height: 1.4;
}

.cookies-warn__text a {
    color: var(--white);
    text-decoration: underline;
}

.cookie-img {
    width: 2.4rem;
    height: 2.4rem;
}

.cookies-warn__button {
    padding: 1.6rem 4rem;

    font-size: 1.6rem;
}

.cookies-warn__button:active {
    filter: brightness(0.9);
}

@media screen and (orientation: portrait) {
    .cookies-warn__container {
        left: 50%;
        transform: translateX(-50%);
        bottom: 1.6rem;

        width: 100%;
    }
}

/* попап о предупреждении о куках */
</style>
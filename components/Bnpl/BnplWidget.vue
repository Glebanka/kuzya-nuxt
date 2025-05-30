<script>
export default {
    props: {
        price: {
            required: true
        },
    },
    mounted() {
        initBnpl()
    },
    beforeUnmount() {
        resetBnpl()
    },
}
</script>
<template>
    <div class="bnpl-card bnpl-card--schedule bnpl-card--schedule-combined bnpl-card--type-7-js" :data-price="price"
        data-payments-number="6" data-first-payment-percents="25" data-payments-interval="14">
        <img class="bnpl-logo" height="24px" width="87px" alt="Логотип Плайт"
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NyIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDg3IDI0Ij4KICA8ZyBjbGlwLXBhdGg9InVybCgjYSkiPgogICAgPHBhdGggZmlsbD0iIzY5NjlGRiIgZD0iTTIzLjQ0NiAxNy45SDE4LjQzYTYuNDI1IDYuNDI1IDAgMSAwLTEyLjg1IDBILjU2NGExMS40NCAxMS40NCAwIDAgMSAyMi44OCAwWiIvPgogICAgPHBhdGggZmlsbD0iIzAyMDIwMiIgZD0iTTI5LjE2NiA3LjU0OGg5LjMyNVYxNy45aC0yLjE5NFY5LjQ2OGgtNC45NTNWMTcuOWgtMi4xNzhWNy41NDhabTEzLjE4IDQuOTczYy4wMTQuNzE4LS4wMzggMS40MzYtLjE1NyAyLjE0NC0uMTA0LjQ5OC0uMjYxLjg0Mi0uNDcgMS4wMzFhMS4yNzMgMS4yNzMgMCAwIDEtLjg2OC4yODJoLS4zNjVWMTcuOWguNzA4Yy43MzEgMCAxLjMzMS0uMTU3IDEuOC0uNDcuNDY3LS4zMTQuODItLjg1NiAxLjA2LTEuNjI3LjIzNi0uNzc3LjM1NC0xLjg0NS4zNTQtMy4yMDVWOS40NjRoMy45ODJ2OC40M2gyLjE4NVY3LjU1M2gtOC4yM3Y0Ljk3Wk02Mi45ODIgMTZoLjQ0NXYxLjloLTEuMTUyYy0uNzQgMC0xLjI0NS0uMTYxLTEuNTE1LS40ODVhMS44MyAxLjgzIDAgMCAxLS4zODQtMS4xNzRjLS4yODQuNDI4LS42NC44MDUtMS4wNTEgMS4xMTMtLjU5NS40NDUtMS4zODQuNjY3LTIuMzY3LjY2N2E1LjI2NiA1LjI2NiAwIDAgMS0yLjAwMS0uMzU0IDIuOTY4IDIuOTY4IDAgMCAxLTEuMzU0LTEuMDQgMi43NTcgMi43NTcgMCAwIDEtLjQ4Ni0xLjYzOGMwLTEuMDY1LjM3OC0xLjg4MyAxLjEzMy0yLjQ1Ni43NTUtLjU3MiAxLjg1Mi0uODU5IDMuMjkxLS44NTloMi42MXYtLjYyN2ExLjY4IDEuNjggMCAwIDAtLjU5OC0xLjM2NWMtLjM5OC0uMzMtLjk1NC0uNDk1LTEuNjY3LS40OTVhMi43OTQgMi43OTQgMCAwIDAtMS41ODguNDE0IDEuNjM3IDEuNjM3IDAgMCAwLS43MzggMS4wOTdoLTIuMTM5YTMuMTcgMy4xNyAwIDAgMSAuNjk3LTEuNzM4IDMuOTE5IDMuOTE5IDAgMCAxIDEuNTc3LTEuMTE5IDUuOTg4IDUuOTg4IDAgMCAxIDIuMjk0LS40MDRjMS4zNzQgMCAyLjQzOS4zMiAzLjE5NC45NTkuNzU1LjY0IDEuMTMyIDEuNTcgMS4xMjkgMi43OTJ2NC4xNDRjMCAuMjU3LjA1My40MzMuMTU2LjUyN2EuNzU1Ljc1NSAwIDAgMCAuNTE0LjE0Wm0tMi44Mi0yLjcwOGgtMi43MThjLS42NzQgMC0xLjE5My4xMjctMS41NTYuMzgzLS4zNjQuMjU3LS41NDYuNjQ3LS41NDcgMS4xNzNhMS4zMDMgMS4zMDMgMCAwIDAgLjUxNSAxLjA2Yy4zNDUuMjc4LjgxMi40MTYgMS40MS40MTZhMy4yMDUgMy4yMDUgMCAwIDAgMS41NDgtLjM0NWMuNDEtLjIxNi43NTMtLjU0MS45OS0uOTQuMjQyLS40Mi4zNjQtLjg5OS4zNTQtMS4zODRsLjAwMy0uMzYzWm03LjUyMiAxLjQzNFY3LjU0OGgtMi4xMzJWMTcuOWgxLjkwMWw1LjYtNy4xOThWMTcuOWgyLjEyMlY3LjU1NmgtMS45MmwtNS41NzEgNy4xNjlabTIuNjQ3LTguMjY2Yy45OTcgMCAxLjc3Ni0uMjQ2IDIuMzM1LS43MzguNTU5LS40OTIuODQzLTEuMTk2Ljg1Mi0yLjExMkg3MS44NGMuMDIzLjM5NS0uMS43ODUtLjM0MyAxLjA5Ny0uMjMuMjctLjYxNS40MDQtMS4xNTQuNDA0LS41MzkgMC0uOS0uMTMzLTEuMTIyLS40MDRhMS42NjYgMS42NjYgMCAwIDEtLjMyOC0xLjA5N0g2Ny4yMWMuMDI3LjkxNi4zMDYgMS42Mi44MzkgMi4xMTIuNTMzLjQ5MiAxLjI5LjczOCAyLjI3NC43MzhoLjAwOFptNi44OTUgMS4wOTd2MS45MmgzLjUxOHY4LjQzMWgyLjE4M3YtOC40M2gzLjUxOVY3LjU0N2wtOS4yMi4wMDhaIi8+CiAgPC9nPgogIDxkZWZzPgogICAgPGNsaXBQYXRoIGlkPSJhIj4KICAgICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGg4N3YyNEgweiIvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+Cjwvc3ZnPg==" />
        <button class="bnpl-help-button" type="button"></button>
        <p class="bnpl-descr">Разбить на части <b>без переплат</b></p>
        <div class="bnpl-schedule-calc">
            <div class="bnpl-schedule-calc__today">
                <div class="bnpl-schedule-calc__descr">Сегодня</div>
                <div class="bnpl-schedule-calc__sum"></div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
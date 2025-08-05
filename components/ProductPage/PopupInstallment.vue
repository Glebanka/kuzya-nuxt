<template>
    <div class="popup-installment popup">
        <div class="popup-installment__container popup__container center w600">
            <div class="popup-installment__title popup__title">Оплатите 25% от стоимости покупки</div>
            <div class="popup-installment__subtitle">Оставшиеся 3 части спишутся автоматически с шагом в две недели
            </div>
            <div class="popup-installment__content popup__content">
                <div class="popup-installment__list">
                    <div class="popup-installment-item _active">
                        <div class="popup-installment-item__day">Сегодня</div>
                        <div class="popup-installment-item__price">1 000 ₽</div>
                    </div>
                    <div class="popup-installment-item">
                        <div class="popup-installment-item__day">24 дек</div>
                        <div class="popup-installment-item__price">1 000 ₽</div>
                    </div>
                    <div class="popup-installment-item">
                        <div class="popup-installment-item__day">7 янв</div>
                        <div class="popup-installment-item__price">1 000 ₽</div>
                    </div>
                    <div class="popup-installment-item">
                        <div class="popup-installment-item__day">21 янв</div>
                        <div class="popup-installment-item__price">1 000 ₽</div>
                    </div>
                </div>
                <div class="popup-installment__btn">
                    <a href="#">
                        <span>Оплатить</span>
                        <svg width="102" height="16" viewBox="0 0 102 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.3906 0.799805H15.988V12.9838H18.3906V0.799805Z" fill="white" />
                            <path d="M13.228 1.48158H10.8253V13.6653H13.228V1.48158Z" fill="white" />
                            <path d="M8.06533 2.24271H5.66266V14.4287H8.06533V2.24271Z" fill="white" />
                            <path d="M2.90267 3.0123H0.5L0.500009 15.1998H2.90268L2.90267 3.0123Z" fill="white" />
                            <path
                                d="M81.8492 7.29102L77.9806 2.98973H75.7189V12.9487H78.0803V6.59469L81.6122 10.3592H82.0487L85.5199 6.59469V12.9487H87.8812V2.98973H85.6196L81.8492 7.29102Z"
                                fill="white" />
                            <path
                                d="M99.1312 2.98973L93.2784 9.46271V2.98973H90.917V12.9487H93.0804L98.9332 6.47574V12.9487H101.295V2.98973H99.1312Z"
                                fill="white" />
                            <path
                                d="M63 6.63386C63 8.21947 63.8671 9.46851 65.1981 9.99221L62.7023 12.9487H65.5926L67.8629 10.2591H70.3197V12.9487H72.681V2.98973H66.6693C64.4278 2.98973 63 4.52311 63 6.63386ZM70.3211 5.18317V8.12807H67.1071C66.0348 8.12807 65.4597 7.53039 65.4597 6.65417C65.4597 5.77795 66.0551 5.18027 67.1071 5.18027L70.3211 5.18317Z"
                                fill="white" />
                            <path
                                d="M52.0269 4.98152C51.8824 8.4066 51.1599 10.6175 49.7451 10.6175H49.391V13.0082L49.7682 13.0285C52.605 13.1866 54.173 10.6972 54.4302 5.26006H58.1616V12.9487H60.5186V2.98973H52.1064L52.0269 4.98152Z"
                                fill="white" />
                            <path
                                d="M43.138 2.85059C39.9443 2.85059 37.6465 5.06144 37.6465 7.96862C37.6465 10.9759 40.1466 13.1084 43.138 13.1084C46.2537 13.1084 48.6743 10.8569 48.6743 7.96862C48.6743 5.0803 46.2537 2.85059 43.138 2.85059ZM43.138 10.7177C41.333 10.7177 40.1032 9.54262 40.1032 7.96862C40.1032 6.35545 41.3345 5.21231 43.138 5.21231C44.9415 5.21231 46.2133 6.40768 46.2133 7.96862C46.2133 9.52956 44.9242 10.7177 43.138 10.7177Z"
                                fill="white" />
                            <path
                                d="M35.1421 3.00851H26.808L26.7285 5.00031C26.61 7.86978 25.8614 10.5985 24.4466 10.6377L23.792 10.658V15.1997L26.1736 15.1949V12.9501H34.447V15.1949H36.8488V10.6377H35.1421V3.00851ZM32.7808 10.6377H27.7416C28.5942 9.34368 29.0508 7.47084 29.1303 5.2803H32.7808V10.6377Z"
                                fill="white" />
                        </svg>
                    </a>
                </div>
                <div class="popup-installment__more">
                    Подробнее о сервисе можно узнать на <a href="//dolyame.ru" target="_blank">dolyame.ru</a>
                </div>
            </div>
            <div class="popup-installment__close popup__close close-popup__js default-anim" v-anim-hover>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>
</template>

<style>

</style>
<script>
import { mapActions, mapState } from 'pinia';

export default {
	props: {
		item: Object,
		index: Number,
	},
	data() {
		return {
			checkedInput: false,
			parsedImg: null,
		}
	},

	methods: {
		...mapActions(useCartStore, [
			'addToCart',
			'removeFromCart',
			'decreaseQuantity',
			'toggleChecked',
		]),
		minusOneProduct() {
			const isLastItem = this.item.quantity <= 1;
			if (!isLastItem) {
				this.decreaseQuantity(this.item)
			} else {
				this.removeFromCart(this.item)
			}
		},
		plusOneProduct() {
			this.addToCart(this.item)
		},
		init() {
			this.parsedImg = this.item.json_imgs;
		},
		addEventListenerToImg() {
			if (this.$refs.imgBlock) {
				this.$refs.imgBlock.addEventListener('error', () => {
					this.item.json_imgs = null;
				});
			}
		},
	},
	mounted() {
		this.init();
	},
	computed: {
		...mapState(useCartStore, {
			findInCart: 'getItemById',
		}),
		isChecked() {
			return this.findInCart(this.item.id).isChecked
		},
		isAvailable() {
			return this.findInCart(this.item.id).status;
		},
	},
	watch: {
		parsedImg() {
			this.$nextTick(() => {
				this.addEventListenerToImg();
			});
		}
	},
}
</script>

<template>
	<div class="basket-products-item form-item" :class="{_checked: isChecked, _unavailable: !isAvailable}">
		<label @click="toggleChecked(item)" :for="item.id" class="form-check-label"></label>
		<div class="basket-products-item__body">
			<div class="basket-products-item__block block-1">
				<div class="basket-products-item__img">
					<template v-if="item.json_imgs">
						<picture>
							<img ref="imgBlock" :src="item.json_imgs" alt="">
						</picture>
					</template>
					<template v-else>
						<picture>
							<img src="~/assets/img/empty-img.png" alt="">
						</picture>
					</template>
				</div>
			</div>
			<div class="basket-products-item__block block-2">
				<div class="basket-products-item__row">
					<div class="basket-products-item__col">
						<div class="basket-products-item__name">{{ item.title }}</div>
						<div class="basket-products-item__articul" v-if="item.code">Артикул: {{ item.code }}</div>
						<div class="basket-products-item__instock hidden">В наличии: {{ item.countProduct }} шт в г.
							Исилькуль,
							ул. Коммунистическая, 30
						</div>
						<div class="basket-products-item__delivery hidden">Доступно для самовывоза сегодня</div>
					</div>
					<div class="basket-products-item__col">
						<div class="basket-products-item__price">
							<span>{{ numberWithSpaces(item.price * item.quantity) }}</span> ₽
						</div>
						<div class="basket-products-item__count"><span>{{ numberWithSpaces(item.price) }}</span>
							₽<template v-if="item.unit">/{{ item.unit }}</template></div>
						<div class="basket-products-item__quantity quantity">
							<div class="quantity__btn minus" @click="minusOneProduct">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M4.5 10.8V9H14.78V10.8H4.5Z" fill="#1D1D1D" />
								</svg>
							</div>
							<div class="quantity__label">
								<span>{{ item.quantity }}</span> <template v-if="item.unit">{{ item.unit }}</template>
							</div>
							<div class="quantity__btn plus" @click="plusOneProduct">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M9.1 18.56V2H10.9V18.56H9.1ZM1.5 11.16V9.44H18.5V11.16H1.5Z"
										fill="#1D1D1D" />
								</svg>
							</div>
						</div>
						<div class="basket-products-item__btns">
							<div class="basket-products-item__btn restore btn-border default-anim">
								<span>Востановить</span></div>
						</div>
					</div>

				</div>
				<div class="basket-products-item__remove" @click="removeFromCart(item)">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"
							stroke="#8C8C8C" stroke-width="2" stroke-linecap="square" stroke-linejoin="round" />
					</svg>
				</div>
			</div>
		</div>
		<router-link :to="'/products/' + item.url_page + '/'"></router-link>

	</div>
</template>

<style scoped></style>

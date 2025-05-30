<script>
import { mapActions, mapState } from 'pinia';
export default {
	setup(props) {
		const parseProduct = ref({
			id: props.product.id,
			title: props.product.title || props.product.name,
			price: props.product.price,
			url_page: props.product.url_page,
			json_imgs: props.product.json_imgs && props.product.json_imgs.length ? props.product.json_imgs[0] : null,
			unit: props.product.unit || null
		});

		const isClient = import.meta.client;

		return {
			parseProduct,
			isClient,
		}
	},
	props: {
		product: Object,
	},
	data() {
		return {
			inCart: Boolean,
			inBasket: false,
			isFavorite: false,
			isCompare: false,
		}
	},
	methods: {
		...mapActions(useCartStore, [
			'addToCart',
			'removeFromCart',
			'decreaseQuantity',
		]),
		getParsePrice(price) {
			return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		},
		errorHandler() {
			this.parseProduct.json_imgs = null;
		},
		handleCartBtn() {
			if (!this.inCart) {
				this.addToCart(this.parseProduct)

				this.inCart = true;
			} else {
				this.removeFromCart(this.parseProduct)
			}
		},
		toggleProductInFavorite() {
			this.isFavorite = !this.isFavorite;
		},
		toggleProductInCompare() {
			this.isCompare = !this.isCompare;
		},
		minusOneProduct() {
			const isLastItem = this.itemQuantity <= 1;
			if (!isLastItem) {
				this.decreaseQuantity(this.parseProduct)
			} else {
				this.removeFromCart(this.parseProduct)
			}
		},
		plusOneProduct() {
			this.addToCart(this.parseProduct)
		},
		init() {
			const parseProducts = () => {
				let productInCart = this.findInCart(this.parseProduct.id)
				if (productInCart) {
					this.inCart = true;
					this.product.quantity = productInCart.quantity;
				} else {
					this.inCart = false;
				}
			}
			parseProducts()
		}
	},
	mounted() {
		this.init();
	},
	watch: {
		isItemInCart(newValue, oldValue) {
			if ((newValue !== oldValue) && newValue == undefined) {
				this.inCart = false;
			}
		}
	},
	computed: {
		...mapState(useCartStore, {
			findInCart: 'getItemById',
		}),
		itemQuantity() {
			const item = this.findInCart(this.product.id);
			if (item) {
				return item.quantity
			} else {
				return null
			}
		},
		isItemInCart() {
			return this.findInCart(this.product.id);
		}
	},
	components: {}
}
</script>
<template>
	<div class="list-products__item card-product card-product__js" :class="[{
		'_basket': inCart,
		'_favorite': isFavorite, '_compare': isCompare
	}]">
		<div class="card-product__body anim-item" v-anim-scroll>
			<router-link :to="'/products/' + parseProduct.url_page + '/'"></router-link>
			<div class="card-product__block">
				<div class="card-product__img">
					<template v-if="isClient">
						<template v-if="parseProduct.json_imgs">
							<picture>
								<img @error="errorHandler" :src="parseProduct.json_imgs">
							</picture>
						</template>
						<template v-else>
							<picture>
								<img src="~/assets/img/empty-img.png" alt="empty-img">
							</picture>
						</template>
					</template>
				</div>
			</div>
			<div class="card-product__block">
				<div class="card-product__info">
					<div class="card-product__name">{{ product.title ? product.title : product.name }}</div>
					<div class="card-product__labels hidden">
						<div class="card-product__label" style="background-color: #ED1E24; color: #fff;">
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M10.1957 9.72809C10.0831 10.4598 9.45348 11 8.71312 11H2C1.44772 11 1 10.5523 1 10V6.5C1 5.94772 1.44772 5.5 2 5.5H3.17506C3.37266 5.5 3.55172 5.38363 3.63197 5.20307L5.39153 1.24406C5.45749 1.09565 5.60467 1 5.76708 1C6.448 1 7 1.552 7 2.23292V4C7 4.27614 7.22386 4.5 7.5 4.5H9.25158C10.1709 4.5 10.8739 5.31945 10.7341 6.22809L10.1957 9.72809Z"
									fill="white" />
								<path
									d="M3.5 11V5.5M1 6.5V10C1 10.5523 1.44772 11 2 11H8.71312C9.45348 11 10.0831 10.4598 10.1957 9.72809L10.7341 6.22809C10.8739 5.31945 10.1709 4.5 9.25158 4.5H7.5C7.22386 4.5 7 4.27614 7 4V2.23292C7 1.552 6.448 1 5.76708 1C5.60467 1 5.45749 1.09565 5.39153 1.24406L3.63197 5.20307C3.55172 5.38363 3.37266 5.5 3.17506 5.5H2C1.44772 5.5 1 5.94772 1 6.5Z"
									stroke="white" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
							<span>Хит продаж</span>
						</div>
						<div class="card-product__label" style="background-color: #0066B3; color: #fff;">
							<span>-40%</span>
						</div>
						<div class="card-product__label" style="background-color: #F7DE00; color: #1D1D1D;">
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M7.00435 1.16869C7.0004 1.09307 6.91867 1.04443 6.85408 1.08395C5.00552 2.21474 4.97188 4.8846 4.99281 5.54019C4.99507 5.61095 4.92793 5.66098 4.8652 5.62817C4.60692 5.49309 4.06267 5.09679 4.00498 4.13749C4.00043 4.06178 3.919 4.0132 3.85398 4.05226C2.74157 4.72067 2 5.92125 2 7.24999C2 9.32107 3.79086 11 6 11C8.20914 11 10 9.32107 10 7.24999C9.99998 4.2707 7.13158 3.60703 7.00435 1.16869Z"
									fill="#ED1E24" stroke="#ED1E24" stroke-width="0.7" />
							</svg>
							<span>Скидки недели</span>
						</div>
					</div>
					<div class="card-product__article" v-if="product.code">Арт.: {{ product.code }}</div>
					<div class="card-product-price">
						<div class="card-product-price__row">
							<div class="card-product-price__value new">{{ getParsePrice(product.price) }} ₽<template
									v-if="product.unit">/{{ product.unit }}</template></div>
						</div>
						<div class="card-product-price__info hidden">Экономия по карте лояльности</div>
					</div>
				</div>
				<div class="card-product__last-row">
					<div class="card-product__btns">
						<div class="card-product__btn btn btn-basket default-anim bg-yellow add-product-basket__js"
							@click="handleCartBtn">
							<div class="default">В корзину</div>
							<div class="ques ques-add">Добавить?</div>
							<div class="ques ques-remove">Удалить?</div>
							<div class="added">
								<svg width="33" height="32" viewBox="0 0 33 32" fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M9.83301 15.8375C11.0883 16.7504 13.5988 19.2609 14.6258 20.9726C15.8811 18.2339 19.0763 12.0717 22.4997 9.33301"
										stroke="white" stroke-width="2" stroke-linecap="square"
										stroke-linejoin="round" />
								</svg>
								<span>В корзине</span>
							</div>
						</div>
						<div class="card-product__quantity quantity quantity__js">
							<div class="quantity__btn minus" @click="minusOneProduct">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M4.5 10.8V9H14.78V10.8H4.5Z" fill="#1D1D1D" />
								</svg>
							</div>
							<div class="quantity__label">
								<span>{{ itemQuantity }}</span> шт.
							</div>
							<div class="quantity__btn plus" @click="plusOneProduct">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M9.1 18.56V2H10.9V18.56H9.1ZM1.5 11.16V9.44H18.5V11.16H1.5Z"
										fill="#1D1D1D" />
								</svg>
							</div>
						</div>
					</div>
					<div class="card-product__icons hidden">
						<div class="card-product__icon product-add-favorite__js" @click="toggleProductInFavorite">
							<svg class="favorite" width="28" height="28" viewBox="0 0 28 28" fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381Z"
									fill="transparent" />
								<path
									d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381ZM21.9645 7.19831C20.2145 5.44598 17.3912 5.37481 15.5595 7.01981L14.002 8.41748L12.4433 7.02098C10.6058 5.37364 7.78835 5.44598 6.03368 7.20064C4.29535 8.93898 4.20785 11.7215 5.80968 13.5601L13.9997 21.763L22.1897 13.5613C23.7927 11.7215 23.7052 8.94248 21.9645 7.19831Z"
									fill="#1d1d1d" />
							</svg>
						</div>
						<div class="card-product__icon product-compare__js" @click="toggleProductInCompare">
							<svg class="comparisons" width="28" height="28" viewBox="0 0 28 28" fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M10.4997 25.6663C15.01 25.6663 18.6663 22.01 18.6663 17.4997C18.6663 12.9893 15.01 9.33301 10.4997 9.33301C5.98935 9.33301 2.33301 12.9893 2.33301 17.4997C2.33301 22.01 5.98935 25.6663 10.4997 25.6663Z"
									fill="transparent" />
								<circle class="circle-1" cx="18.0833" cy="9.91634" r="7.58333" fill="transparent" />
								<circle cx="10.5" cy="17.5" r="7.5" fill="transparent" />
								<path class="border"
									d="M18.5937 18.5937C22.5867 18.0591 25.6663 14.639 25.6663 10.4997C25.6663 5.98935 22.01 2.33301 17.4997 2.33301C13.3603 2.33301 9.94025 5.41262 9.40565 9.40566M18.6663 17.4997C18.6663 22.01 15.01 25.6663 10.4997 25.6663C5.98935 25.6663 2.33301 22.01 2.33301 17.4997C2.33301 12.9893 5.98935 9.33301 10.4997 9.33301C15.01 9.33301 18.6663 12.9893 18.6663 17.4997Z"
									stroke="#1D1D1D" stroke-width="2.3" stroke-linecap="round"
									stroke-linejoin="round" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style></style>

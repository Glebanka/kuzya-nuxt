<script>
export default {
	props: [
		'tabs'
	],
	data() {
		return {
			isActiveSelect: false,
			activeItem: 'all',
		}
	},
	mounted() {
		let ESC = 27;
		document.addEventListener('keydown', (e) => {
			if (e.keyCode === ESC) {
				this.closeSelect();
			}
		});
		document.addEventListener('mouseup', (e) => {
			let btnSelect = document.querySelector('.btn-select');
			if (btnSelect && btnSelect.contains(e.target) === false) {
				this.closeSelect();
			}
		});


	},
	methods: {
		countDiscountsPerTab(id) {
			const tab = this.tabs.find(tab => tab.id === id);
			return tab ? tab.discounts.length : 0;
		},
		toggleSelect(e) {
			this.isActiveSelect = !this.isActiveSelect;
		},
		closeSelect() {
			this.isActiveSelect = false;
		},
		selectItem(indx) {
			this.isActiveSelect = false;
			this.activeItem = indx;

			let $actions = selectElements('.all-actions-item');
			if (indx !== 'all') {
				let filters = selectElements('.select-action-filter__js')[indx].dataset.filters;
				if (filters) {
					if ($actions.length) {
						$actions.forEach(($action, indx) => {
							if ($action.classList.contains(filters)) {
								$action.classList.remove('hidden');
							} else {
								$action.classList.add('hidden');
							}
						})
					}
				}
			} else {
				if ($actions.length) {
					setClass($actions, { remove: 'hidden' });
				}
			}

		},

	},
	computed: {
		totalDiscounts() {
			if (!this.tabs) return 0;
			return this.tabs.reduce((acc, tab) => acc + (tab.discounts ? tab.discounts.length : 0), 0);
		},
		getActiveItemName() {
			if (!this.tabs) return 0;
			if (this.activeItem === 'all') return 'Все акции';
			return this.tabs[this.activeItem].name;
		},
	}
}
</script>

<template>
	<div class=" anim-item z-index-10" v-anim-scroll>
		<div class="all-actions__btn-select btn-select btn-select__js" :class="{ '_active': isActiveSelect }">
			<div class="btn-select__head" @click="toggleSelect">
				<div class="btn-select__label">{{ getActiveItemName }} <sup>{{ (activeItem === 'all') ? totalDiscounts : countDiscountsPerTab(tabs[activeItem].id) }}</sup></div>
			</div>
			<div class="btn-select__body">
				<div class="btn-select__content">
					<div class="btn-select__item btn-border default-anim select-action-filter__js all" v-anim-hover :class="{ '_active': activeItem === 'all' }" @click="selectItem('all')">
						Все акции <sup>{{ totalDiscounts }}</sup>
					</div>

					<div v-for="(tab, indx) in this.tabs" class="btn-select__item btn-border default-anim select-action-filter__js" v-anim-hover :class="{ '_active': activeItem === (indx) }" @click="selectItem(indx)" :data-filters="'filter-' + tab.id">
						{{ tab.name }} <sup>{{ countDiscountsPerTab(tab.id) }}</sup>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>

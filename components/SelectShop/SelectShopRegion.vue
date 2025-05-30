<script setup>
defineProps({
	cities: Array,
});

const isActive = ref(false);
const selectedCity = ref('Выберите ваш район');

onMounted(init);

function init() {
	let selectRegion = document.querySelector('.select-region__js');
	document.addEventListener('mouseup', (e) => {
		if (selectRegion.contains(e.target) === false) {
			isActive.value = false;
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			isActive.value = false;
		}
	});
}

function toggleSelect() {
	isActive.value = !isActive.value;
}

function selectCity(city) {
	const $list = selectElements('.select-shop-region__list .select-shop-region-item');
	if (city === 'all') {
		selectedCity.value = 'Выберите ваш район';
		if ($list.length) {
			setClass($list, { remove: 'hidden' });
		}
	} else {
		selectedCity.value = city.name;
		if ($list.length) {
			$list.forEach(($item, indx) => {
				if ($item.classList.contains('filterCity-' + city.id)) {
					setTimeout(() => {
						$item.classList.remove('hidden');
						$item.classList.add('_active');
					}, 10);
				} else {
					$item.classList.add('hidden');
					$item.classList.remove('_active');
				}
			});
		}
	}
	isActive.value = false;
}
</script>
<template>
	<div class="select-shop-region__select select-box select-region__js" :class="{ '_active': isActive }">
		<input type="hidden" class="select-city-hidden select-box-input-hidden hidden" v-model="selectedCity">
		<div class="select-box__head" @click="toggleSelect">
			<div class="select-box__label">{{ selectedCity }}</div>
		</div>
		<div class="select-box__body bg-white">
			<div class="select-box__content">
				<ul class="list-style-none select-box__list">
					<li class="select-box-item__js all" :class="{ 'hidden': selectedCity === 'Выберите ваш район' }"
						@click="selectCity('all')">
						<span>
							Все районы
						</span>
					</li>
					<template v-for="city in cities" :key="'selectCity-'+city.id">
						<li class="select-box-item__js" :class="{ 'hidden': city.name === selectedCity }"
							:data-filter="'filterCity-' + city.id" @click="selectCity(city)">
							<span>
								{{ city.name }}
							</span>
						</li>
					</template>
				</ul>
			</div>
		</div>
	</div>
</template>

<style></style>
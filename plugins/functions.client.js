import { ref } from "vue";


// КОД ПАРАШИ НЕ ИСПОЛЬЗОВАТЬ

export const $page = ref(null);
export const $footer = ref(null);
export const $selectShopPopup = ref(null);
export const $popupShare = ref(null);
export const $body = ref(null);

$page.value = selectElement('.page');
$footer.value = selectElement('.footer');
$selectShopPopup.value = selectElement('.select-shop');
$popupShare.value = selectElement('.popup-share');


export function strToHtml(str) {
	return new DOMParser().parseFromString(str, 'text/html').body;
}
export function dynamicAdaptive(size) {
	// ex: data-da="where, size, position"
	// let $items = document.querySelectorAll('[data-da]');
	if ($items.length) {
		$items.forEach(function ($item, indx) {
			let _data = $item.getAttribute('data-da').split(',');
			let _where = _data[0].trim();
			let _sizeScreen = _data[1].trim();
			let _pos = _data[2].trim();

			if (size === 'max' && documentWidth <= _sizeScreen) {
				moveItem();
			}
			if (size === 'min' && documentWidth >= _sizeScreen) {
				moveItem();
			}

			function moveItem() {
				if (_pos === 'first') {
					// document.querySelectorAll(_where)[indx].insertAdjacentElement('afterbegin', $item);
				}
				if (_pos === 'last') {
					// document.querySelectorAll(_where)[indx].insertAdjacentElement('beforeEnd', $item);
					console.log(true);
				}
			}
		});
	}
}
export function diffElements($items, i, _parent) {
	if ($items.length) {
		$items.forEach((item, indx) => {
			if (i !== indx) {
				if (_parent) {
					item.parentElement.classList.remove('_active');
				} else {
					item.classList.remove('_active');
				}
			}
		});
	}
}
export function reverseArr(input) {
	let ret = new Array();
	for (let i = input.length - 1; i >= 0; i--) {
		ret.push(input[i]);
	}
	return ret;
}
export function heightNull($items) {
	if ($items.length) {
		$items.forEach(function ($item, indx) {
			$item.style.height = 0;
		});
	}
}
export function maxHeightBlock($items) {
	let items = $items;
	let rowMap = new Map();

	items.forEach(item => {
		let rect = item.getBoundingClientRect();
		let top = rect.top;

		if (!rowMap.has(top)) {
			rowMap.set(top, []);
		}

		let height = item.offsetHeight;
		rowMap.get(top).push({ element: item, height: height });
	});

	rowMap.forEach(heights => {
		let maxHeightInRow = Math.max(...heights.map(item => item.height));
		heights.forEach(item => {
			item.element.style.height = maxHeightInRow + 'px';
		});
	});
}
export function numberWithSpaces(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
/*
let telPattern = /^\+7\([0-9]{3}\)[0-9]{3}\-[0-9]{2}\-[0-9]{2}$/;
let emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
ex:
email.addEventListener('input', function(){
	if (validate(emailPattern, item.value)){
		console.log(true)
	} else{
		console.log(false)
	}
})
*/
export function validate(regex, inp) {
	return regex.test(inp);
}

export class Submenu {
	constructor($items) {
		this.items = $items;
		if (this.items.length) {
			this.items.forEach((item, indx) => {
				this.click(item, indx);
			});
		}
	}
	click(item, indx) {
		item.addEventListener('click', (e) => {
			diffElements(this.items, indx, true);
			item.parentElement.classList.toggle('_active');
			e.preventDefault();
		});
	}
	close() {
		if (this.items.length) {
			this.items.forEach((item, indx) => {
				item.parentElement.classList.remove('_active');
				console.log('asg')
			});
		}
	}
}
export class Tooltip {
	constructor($items) {
		this.items = $items;
		this.items.forEach(($item, indx) => {
			this.click($item, indx)
		});
	}
	click($item, indx) {
		$item.querySelector('.toggle-tooltip__js').addEventListener('click', () => {
			diffElements(this.items, indx, false);
			$item.classList.toggle('_active');
		});
		$item.querySelector('.close-tooltip__js').addEventListener('click', () => {
			$item.classList.remove('_active');
		});
	}
	close() {
		this.items.forEach(($item, indx) => {
			$item.classList.remove('_active');
		});
	}
}
export const _slideUp = (target, duration = 300) => {
	target.style.transitionProperty = 'height, margin, padding';
	target.style.transitionDuration = duration + 'ms';
	target.style.height = target.offsetHeight + 'px';
	target.offsetHeight;
	target.style.overflow = 'hidden';
	target.style.height = 0;
	target.style.paddingTop = 0;
	target.style.paddingBottom = 0;
	target.style.marginTop = 0;
	target.style.marginBottom = 0;
	window.setTimeout(() => {
		target.style.display = 'none';
		target.style.removeProperty('height');
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		target.style.removeProperty('overflow');
		target.style.removeProperty('transition-duration');
		target.style.removeProperty('transition-property');
		target.classList.remove('_slide');
	}, duration);
}
export const _slideDown = (target, duration = 300) => {
	target.style.removeProperty('display');
	let display = window.getComputedStyle(target).display;
	if (display === 'none')
		display = 'block';
	target.style.display = display;
	let height = target.offsetHeight;
	target.style.overflow = 'hidden';
	target.style.height = 0;
	target.style.paddingTop = 0;
	target.style.paddingBottom = 0;
	target.style.marginTop = 0;
	target.style.marginBottom = 0;
	target.offsetHeight;
	target.style.transitionProperty = 'height, margin, padding';
	target.style.transitionDuration = duration + 'ms';
	target.style.height = height + 'px';
	target.style.removeProperty('padding-top');
	target.style.removeProperty('padding-bottom');
	target.style.removeProperty('margin-top');
	target.style.removeProperty('margin-bottom');
	window.setTimeout(() => {
		target.style.removeProperty('height');
		target.style.removeProperty('overflow');
		target.style.removeProperty('transition-duration');
		target.style.removeProperty('transition-property');
		target.classList.remove('_slide');
	}, duration);
}
export const _slideToggle = (target, duration = 300) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		if (window.getComputedStyle(target).display === 'none') {
			return _slideDown(target, duration);
		} else {
			return _slideUp(target, duration);
		}
	}
}
export function ftransitionDelay($items, _start, _step, _delay, _col) {
	let i = 0;
	if (_delay === undefined || _delay === false) {
		$items.forEach(function ($item, indx) {
			$item.style.transitionDelay = _start + (i * _step) + 'ms';
			if ((i + 1) % _col === 0) {
				i = -1;
			}
			i++;
		});
	} else {
		$items.forEach(function ($item, indx) {
			$item.style.transitionDelay = _delay + 'ms';
		});
	}
}
export class Accordions {
	constructor($items) {
		this.items = $items;
		if (this.items.length) {
			this.items.forEach(($item, indx) => {
				this.click($item, indx);
			});
		}
	}
	click($item, indx) {
		$item.querySelector('.toggle-accordion-item__js').addEventListener('click', () => {
			$item.classList.toggle('_active');
			if ($item.classList.contains('_active')) {
				_slideDown($item.querySelector('.accordion-item__body'))
				$item.querySelector('.accordion-item__body').style.height = $item.querySelector('.accordion-item__content').offsetHeight + 'px';
			} else {
				_slideUp($item.querySelector('.accordion-item__body'))
				$item.querySelector('.accordion-item__body').style.height = 0;
			}
		});
	}

	close() {
		if (this.items.length) {
			this.items.forEach(($item, indx) => {
				$item.classList.remove('_active');
				$item.querySelector('.accordion-item__body').style.height = 0;
			});
		}
	}
}
export class Tabs {
	constructor($items) {
		this.tabs = $items;
		if (this.tabs.length) {
			this.tabs.forEach(($tab, indx) => {
				this.click($tab, indx);
			});
		}
	}

	click($tab, indx) {
		let i = 0;
		$tab.addEventListener('click', (e) => {
			let _this = e.target;

			if (_this.closest('.click-tab-item__js')) {
				let $item = _this.closest('.click-tab-item__js');
				let indx = getIndex($item, $tab.querySelectorAll('.click-tab-item__js'));

				setClass($tab.querySelectorAll('.click-tab-item__js'), { remove: '_active' });
				if ($tab.querySelectorAll('.tab-item-block')[indx]) {
					siblingsClass($tab.querySelectorAll('.tab-item-block')[indx], { remove: '_active' });
				}

				$item.classList.add('_active');
				if ($tab.querySelectorAll('.tab-item-block')[indx]) {
					$tab.querySelectorAll('.tab-item-block')[indx].classList.add('_active');
				}
			} else {
				return;
			}
		});
	}

}
export class SelectBox {
	constructor($items) {
		this.items = document.querySelectorAll($items);
		if (this.items.length) {
			this.items.forEach(($item, indx) => {
				this.click($item, indx);
			});
		}
	}
	click($item, indx) {
		$item.querySelector('.select-box__head').addEventListener('click', () => {
			diffElements(this.items, indx, false);
			$item.classList.toggle('_active');
			if ($item.classList.contains('sb-anim-height')) {
				if ($item.classList.contains('_active')) {
					_slideDown($item.querySelector('.select-box__body'));
				} else {
					_slideUp($item.querySelector('.select-box__body'));
				}
			}

		});
		$item.addEventListener('click', (e) => {
			if (e.target.closest('.select-box-item__js')) {
				let $this = e.target.closest('.select-box-item__js');

				$item.querySelector('.select-box__label').textContent = $this.querySelector('span').textContent.trim();

				if ($item.querySelector('.select-box-input-hidden')) {
					$item.querySelector('.select-box-input-hidden').value = $this.querySelector('span').textContent.trim();
				}

				if (!$item.classList.contains('no-hidden-li')) {
					siblingsClass($this, { remove: 'hidden' });
					$this.classList.add('hidden');
				}


				$item.classList.add('_selected');
				$item.classList.remove('_active');
				if ($item.classList.contains('sb-anim-height')) {
					_slideUp($item.querySelector('.select-box__body'));
				}
			}
		});
	}
	close() {
		if (this.items.length) {
			this.items.forEach(($item, indx) => {
				$item.classList.remove('_active');
				if ($item.classList.contains('sb-anim-height')) {
					_slideUp($item.querySelector('.select-box__body'));
				}
			});
		}
	}
}

export class BtnSelect {
	constructor($items) {
		this.items = $items;
		if (this.items.length && !isDesktop) {
			this.items.forEach(($item, indx) => {
				$item.addEventListener('click', (e) => {
					if (e.target.closest('.btn-select__head')) {
						$item.classList.toggle('_active');
					} else if (e.target.closest('.btn-select__item')) {
						$item.querySelector('.btn-select__label').innerHTML = e.target.closest('.btn-select__item').innerHTML;
						$item.classList.remove('_active');
					} else {
						return;
					}
				});
			});
		}
	}

	close() {
		this.items.forEach(($item, indx) => {
			$item.classList.remove('_active');
		})
	}
}

export function sliderSlideOpacity(slider, _count) {
	console.log(slider.querySelectorAll('.swiper-slide').length)
	if (slider.el) {
		// let $slides = slider.el.querySelectorAll('.swiper-slide');
		if ($slides.length) {
			$slides.forEach(($item, indx) => {
				if (indx > (_count - 1)) {
					$item.classList.add('_opacity');
				}
			});
		}

		slider.on('realIndexChange', function (e) {
			slider.el.querySelectorAll('.swiper-slide').forEach(($item, indx) => {
				if (indx === e.realIndex) {
					$item.classList.remove('_opacity');
				}
				if (indx < e.realIndex) {
					$item.classList.add('_opacity');
				} else if (indx >= (e.realIndex + (_count))) {
					$item.classList.add('_opacity');
				} else if (indx <= (e.realIndex + (_count - 1))) {
					$item.classList.remove('_opacity');
				}
			})
		});
	}
}

export function totalLength(path) {
	let len = Math.round(path.getTotalLength());
}

export function defaultSlider($slider, _options = {}) {
	const swiper = new Swiper($slider, {
		// Optional parameters
		/*direction: 'vertical',*/
		// allowTouchMove: false,
		slidesPerView: 'auto', //кол-во слайдов для показа, может быть значение 'auto'
		spaceBetween: 0,
		// Navigation arrows
		navigation: {
			nextEl: $slider.closest('section').querySelector('.slider-arrow__js.right'),
			prevEl: $slider.closest('section').querySelector('.slider-arrow__js.left'),
		},
		scrollbar: {
			el: $slider.closest('section').querySelector('.slider-scrollbar__js'),
			draggable: true,
		},
		..._options,
	});

}

export async function oAjax(url, type) {
	let response = await fetch(url, {
		method: 'POST',
	});

	if (response.ok) {
		try {
			if (type === 'json') {
				return await response.json();
			} else if (type === 'text') {
				return await response.text();
			} else if (type === 'formData') {
				return await response.formData();
			} else if (type === 'blob') {
				return await response.blob();
			} else if (type === 'arrayBuffer') {
				return await response.arrayBuffer();
			} else if (type === 'body') {
				return await response.body;
			}
		}
		catch (err) {
			console.log(err)
		}
	} else {
		return false;
	}
}

export async function sendDataAjax(url, data, sendType, getType, _method = 'POST', optionsResponse = {}) {
	let sData = (sendType === 'formData') ? new FormData() : data;
	if (sendType === 'formData') {
		for (let key in data) {
			if (data.hasOwnProperty(key)) { //* если свойство содержится внутри объекта, а не в прототипе
				sData.append(key, data[key]);
			}
		}
	}

	let response = await fetch(url, {
		method: _method,
		body: sData,
		...optionsResponse
	});
	if (response.ok) {
		try {
			if (getType === 'json') {
				return await response.json();
			} else if (getType === 'text') {
				return await response.text();
			} else if (getType === 'formData') {
				return await response.formData();
			} else if (getType === 'blob') {
				return await response.blob();
			} else if (getType === 'arrayBuffer') {
				return await response.arrayBuffer();
			} else if (getType === 'body') {
				return await response.body;
			}
		}
		catch (err) {
			console.log(err)
		}
	} else {
		return false;
	}
}

export function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name, value, options = {}) {
	options = {
		path: '/',
		// при необходимости добавьте другие значения по умолчанию
		...options
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

export function setMetaTags(siteData, data, meta) {
	let updatedSiteData = { ...siteData };
	updatedSiteData.keywords = data.meta_key ? data.meta_key : null;
	updatedSiteData.description = data.meta_desc ? data.meta_desc : null;
	if (meta && meta.SHOW_OPEN_GRAPH) {
		updatedSiteData.og_type = data.og_type ? data.og_type : meta.OG_TYPE ? meta.OG_TYPE : null;
		updatedSiteData.og_url = data.og_url ? data.og_url : meta.OG_URL ? meta.OG_URL : null;
		updatedSiteData.og_title = data.og_title ? data.og_title : meta.OG_TITLE ? meta.OG_TITLE : null;
		updatedSiteData.og_description = data.og_description ? data.og_description : meta.OG_DESCRIPTION ? meta.OG_DESCRIPTION : null;
		updatedSiteData.og_image = data.og_image ? data.og_image : meta.OG_IMAGE ? meta.OG_IMAGE : null;
		updatedSiteData.og_image_width = data.og_image_width ? data.og_image_width : meta.OG_IMAGE_WIDTH ? meta.OG_IMAGE_WIDTH : null;
		updatedSiteData.og_image_height = data.og_image_width ? data.og_image_width : meta.OG_IMAGE_HEIGHT ? meta.OG_IMAGE_HEIGHT : null;
		updatedSiteData.link_open_graph_image = data.og_image ? data.og_image : meta.OG_IMAGE ? meta.OG_IMAGE : null;
	}
	updatedSiteData.twitter_title = data.twitter_title ? data.twitter_title : null;
	updatedSiteData.twitter_description = data.twitter_description ? data.twitter_description : null;
	updatedSiteData.twitter_url = data.twitter_url ? data.twitter_url : null;
	updatedSiteData.twitter_card = data.twitter_card ? data.twitter_card : null;
	updatedSiteData.canonical = data.canonical ? data.canonical : null;
	return updatedSiteData;
}


export let CalendarDOMTemplate = {
	default: `
			<div class="vanilla-calendar-header">
				<div class="vanilla-calendar-header__content ">
					<#Month /> <#Year />
				</div>
				<#ArrowPrev />
				<#ArrowNext />
			</div>
			<div class="vanilla-calendar-wrapper">
				<#WeekNumbers />
				<div class="vanilla-calendar-content">
					<#Week />
					<#Days />
				</div>
			</div>
			<#ControlTime />
		`,
	month: `
			<div class="vanilla-calendar-header">
				<div class="vanilla-calendar-header__content">
					<#Month /> | <#Year />
				</div>
			</div>
			<div class="vanilla-calendar-wrapper">
				<div class="vanilla-calendar-content">
					<#Months />
				</div>
			</div>
		`,
	year: `
			<div class="vanilla-calendar-header">
				<div class="vanilla-calendar-header__content">
					<#Month /> | <#Year />
				</div>
				<#ArrowPrev />
				<#ArrowNext />
			</div>
			<div class="vanilla-calendar-wrapper">
				<div class="vanilla-calendar-content">
					<#Years />
				</div>
			</div>
		`,
}

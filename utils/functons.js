export const pxToPercent = (px, percent) => (px * percent / 100);
export const remToPixels = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

export function selectElements(el) {
	return document.querySelectorAll(el);
}
export function selectElement(el) {
	return document.querySelector(el);
}
export function getSiblings(elem) {
	if (elem) {
		let all = [];
		let left = [];
		let right = [];
		let sibling = elem;
		while (sibling.previousSibling) {
			sibling = sibling.previousSibling;
			sibling.nodeType == 1 && all.push(sibling) && left.push(sibling);
		}
		sibling = elem;
		while (sibling.nextSibling) {
			sibling = sibling.nextSibling;
			sibling.nodeType == 1 && all.push(sibling) && right.push(sibling);
		}
		return { all, left, right };
	}
}
export function siblingsClassLeft(item, _action) {
	if (getSiblings(item).left) {
		getSiblings(item).left.forEach(function ($item, indx) {
			if (_action.add) {
				let classes = _action.add.replace(/ /g, '').split(',');
				$item.classList.add(...classes);
			}
			if (_action.remove) {
				let classes = _action.remove.replace(/ /g, '').split(',');
				$item.classList.remove(...classes);
			}
			if (_action.toggle) {
				let classes = _action.toggle.replace(/ /g, '').split(',');
				$item.classList.toggle(...classes);
			}
		});
	}

}
export function siblingsClassRight(item, _action) {
	if (getSiblings(item).right) {
		getSiblings(item).right.forEach(function ($item, indx) {
			if (_action.add) {
				let classes = _action.add.replace(/ /g, '').split(',');
				$item.classList.add(...classes);
			}
			if (_action.remove) {
				let classes = _action.remove.replace(/ /g, '').split(',');
				$item.classList.remove(...classes);
			}
			if (_action.toggle) {
				let classes = _action.toggle.replace(/ /g, '').split(',');
				$item.classList.toggle(...classes);
			}
		});
	}

}
export function siblingsClass(item, _action) {
	if (getSiblings(item).all) {
		getSiblings(item).all.forEach(function ($item, indx) {
			if (_action.add) {
				let classes = _action.add.replace(/ /g, '').split(',');
				$item.classList.add(...classes);
			}
			if (_action.remove) {
				let classes = _action.remove.replace(/ /g, '').split(',');
				$item.classList.remove(...classes);
			}
			if (_action.toggle) {
				let classes = _action.toggle.replace(/ /g, '').split(',');
				$item.classList.toggle(...classes);
			}
		});
	}

}
export function setClass($items, _action) {
	if ($items.length) {
		$items.forEach(function ($item, indx) {
			if (_action.add) {
				let classes = _action.add.replace(/ /g, '').split(',');
				$item.classList.add(...classes);
			}
			if (_action.remove) {
				let classes = _action.remove.replace(/ /g, '').split(',');
				$item.classList.remove(...classes);
			}
			if (_action.toggle) {
				let classes = _action.toggle.replace(/ /g, '').split(',');
				$item.classList.toggle(...classes);
			}
		});
	}
}
export function siblingsAction($item, action) {
	if (getSiblings($item).all) {
		getSiblings($item).all.forEach(($el, indx) => {
			action($el, indx);
		});
	}
}
export function eventsItems($items, _nameEvent) {
	if ($items.length) {
		$items.forEach(function ($item, indx) {
			let ev = Object.keys(_nameEvent).map(function (key) {
				return $item.addEventListener(key, _nameEvent[key]);
			});
		});
	}
}
export function getCoords(elem) {
	if (elem) {
		let box = elem.getBoundingClientRect();

		let body = document.body;
		let docEl = document.documentElement;

		let scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop;
		let scrollLeft = window.scrollX || docEl.scrollLeft || body.scrollLeft;

		let clientTop = docEl.clientTop || body.clientTop || 0;
		let clientLeft = docEl.clientLeft || body.clientLeft || 0;

		let top = box.top + scrollTop - clientTop;
		let left = box.left + scrollLeft - clientLeft;

		return {
			top: top,
			left: left,
		};
	}
}

export function isTokenExpired(token) {
	const payload = JSON.parse(atob(token.split('.')[1]));
	const exp = payload.exp;

	return Date.now() >= exp * 1000;
}
let inputElement;
let outputElement;
document.addEventListener('DOMContentLoaded', function () {
	inputElement = document.getElementById('input');
	outputElement = document.getElementById('output');
	document.getElementById('input').addEventListener('paste', handlePaste);
	const dropdowns = document.getElementsByClassName('dropdown');
	Array.from(dropdowns, (e) => dropdown(e));

	document.addEventListener('click', function (e) {
		if (!e.target.closest('.dropdown')) {
			const openDropdowns = document.querySelectorAll('.dropdown.open');
			openDropdowns.forEach(function (dropdown) {
				const input = dropdown.querySelector('input');
				const optionsList = dropdown.querySelector('.options');
				const borderRadius = parseInt(input.style.borderRadius, 10);
				dropdown.classList.remove('open');
				input.style.borderBottomRightRadius = borderRadius + 'px';
				input.style.borderBottomLeftRadius = borderRadius + 'px';
				optionsList.style.maxHeight = 0;
			});
		}
	});
});
function handlePaste(event) {
	event.preventDefault();
	const clipboardData = event.clipboardData || window.clipboardData;
	const pastedText = clipboardData.getData('text');
	const keys = {
		HTML: [/<([a-z][a-z0-9]*)\b[^>]*>/i],
		PITHL: [/domBuilder/i],
	};
	let parser, formatter;
	for (let key in keys) {
		if (keys[key].some((pattern) => pattern.test(pastedText))) {
			parser = window['parse' + key];
			formatter = window['format' + key];
			break;
		}
	}
	let selectedFormat = eval('formatPITHL');
	if (formatter) {
		formatter(pastedText, 'input');
	} else {
		errorHandler('format');
		setField('input', pastedText);
	}
	document.getElementById('submit').addEventListener('click', function () {
		const data = inputElement.value;
		const output = parser(data);
		selectedFormat(output, 'output');
	});
}
function formatHTML(rawInput, target) {
	let formattedCode = prettier.format(rawInput, {
		parser: 'html',
		plugins: [prettierPlugins.html],
	});
	setField(target, formattedCode);
}
function formatPITHL(input, target) {
	const key = 'dom';
	const inputString = `${input}`.replace(/\s+/g, '');
	let depth = 0;
	let waiting = false;
	const formatted = Array.from(inputString, (char, i) => {
		if (char === '[' && inputString[i + 1] !== ']') {
			depth++;
			return '[\n' + '  '.repeat(depth);
		} else if (char === ']' && inputString[i - 1] !== '[') {
			waiting = true;
			return char;
		} else if (waiting && char === ',') {
			depth--;
			waiting = false;
			return ',\n' + '  '.repeat(depth);
		} else if (char === ',' && inputString.substring(i + 1).startsWith(key)) {
			return ',\n' + '  '.repeat(depth);
		} else {
			return char;
		}
	});
	setField(target, formatted.join(''));
}
function setField(target, formattedCode) {
	document.getElementById(target).value += formattedCode;
}
function errorHandler(location) {
	switch (location) {
		case 'format':
			console.error('No matching format');
			break;
		default:
			break;
	}
}
function escapeQuotes(str) {
	return str.replace(/'/g, "\\'");
}

function parseHTML(html, depth = 0) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const element = doc.body.firstChild;
	let command = 'domBuilder(';
	command += `'${element.tagName.toLowerCase()}', {`;
	command += Array.from(element.attributes)
		.map((attr) => `'${attr.name}': '${escapeQuotes(attr.value)}'`)
		.join(', ');
	command += '}, [';
	command += Array.from(element.children)
		.map((child) => {
			if (child.nodeType === Node.ELEMENT_NODE) {
				return parseHTML(child.outerHTML, depth + 1);
			} else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
				return `'${escapeQuotes(child.textContent.trim())}'`;
			}
			return null;
		})
		.filter((x) => x !== null)
		.join(', ');
	command += '])';
	return command;
}
function parsePITHL(code) {
	let indentLevel = 0;
	let formattedCode = '';
	const indentString = '  ';

	function indent() {
		for (let i = 0; i < indentLevel; i++) {
			formattedCode += indentString;
		}
	}

	function formatAttributes(attributes) {
		const attributeKeys = Object.keys(attributes);
		const attributeString = attributeKeys.map((key) => `${key}="${attributes[key]}"`).join(' ');
		return attributeString;
	}

	function formatElement(tag, attributes, children) {
		indent();
		formattedCode += `<${tag}`;
		if (Object.keys(attributes).length > 0) {
			formattedCode += ` ${formatAttributes(attributes)}`;
		}

		if (children.length > 0) {
			formattedCode += '>\n';
			indentLevel++;
			children.forEach((child) => formatNode(child));
			indentLevel--;
			indent();
			formattedCode += `</${tag}>\n`;
		} else {
			formattedCode += ' />\n';
		}
	}

	function formatText(text) {
		indent();
		formattedCode += text + '\n';
	}

	function formatNode(node) {
		if (typeof node === 'string') {
			formatText(node);
		} else {
			const { tag, attributes, children } = node;
			formatElement(tag, attributes, children);
		}
	}

	formatNode(code);
	return formattedCode;
}

function dropdown(dropdown) {
	let input = dropdown.querySelector('input');
	let optionsList = dropdown.querySelector('.options');
	const width = input.offsetWidth;
	const height = input.offsetHeight;
	const borderRadius = Math.min(width, height) / 2;
	input.style.borderRadius = borderRadius + 'px';

	input.addEventListener('click', function (event) {
		event.stopPropagation();
		const otherDropdowns = document.querySelectorAll('.dropdown.open');
		otherDropdowns.forEach(function (otherDropdown) {
			if (otherDropdown !== dropdown) {
				const otherInput = otherDropdown.querySelector('input');
				const otherOptionsList = otherDropdown.querySelector('.options');
				otherDropdown.classList.remove('open');
				otherInput.style.borderBottomRightRadius = borderRadius + 'px';
				otherInput.style.borderBottomLeftRadius = borderRadius + 'px';
				otherOptionsList.style.maxHeight = 0;
			}
		});
		dropdown.classList.toggle('open');
		if (dropdown.classList.contains('open')) {
			openList();
		} else {
			closeList();
		}
	});
	function openList() {
		input.style.borderBottomRightRadius = 0;
		input.style.borderBottomLeftRadius = 0;
		optionsList.style.maxHeight = optionsList.scrollHeight + 'px';
	}

	function closeList() {
		input.style.borderBottomRightRadius = borderRadius + 'px';
		input.style.borderBottomLeftRadius = borderRadius + 'px';
		optionsList.style.maxHeight = 0;
	}

	let options = optionsList.querySelectorAll('.option');
	options.forEach(function (option) {
		option.addEventListener('click', function () {
			input.value = option.innerText;
			options.forEach(function (opt) {
				opt.classList.remove('selected');
			});
			option.classList.add('selected');
			dropdown.classList.remove('open');
			closeList();
		});
	});
}

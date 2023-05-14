// =================================================================
// Detect and format code when content is pasted into the input textarea
// =================================================================
let inputElement;
let outputElement;

document.addEventListener('DOMContentLoaded', function () {
	inputElement = document.getElementById('input');
	outputElement = document.getElementById('output');
	// Add an event listener for the paste event on the input element
	document.getElementById('input').addEventListener('paste', handlePaste);
});
// Event handler for the paste event
function handlePaste(event) {
	event.preventDefault();

	const clipboardData = event.clipboardData || window.clipboardData;
	const pastedText = clipboardData.getData('text');

	// Detect the language based on the keys
	const keys = {
		Html: [/<([a-z][a-z0-9]*)\b[^>]*>/i],
		Pithl: [/domBuilder/i],
	};

	let parser, formatter;
	for (let key in keys) {
		if (keys[key].some((pattern) => pattern.test(pastedText))) {
			parser = window['parse' + key];
			formatter = window['format' + key];
			console.log('Parsing data with: ' + parser);
			console.log('formatting data with: ' + formatter);
			break;
		}
	}
	let selectedFormat = formatPithl;
	// Set the pasted text as the value of the input element
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
function formatHtml(rawInput, target) {
	console.log(rawInput);
	var formattedCode = prettier.format(rawInput, {
		parser: 'html',
		plugins: [prettierPlugins.html],
	});
	document.getElementById(target).value = formattedCode;
}

function formatPithl(input, target) {
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
	document.getElementById(target).value = formattedCode;
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

// =================================================================
// html parser
// =================================================================
function parseHtml(html, depth = 0) {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	const element = template.content.firstChild;
	console.log(element);

	let command = 'domBuilder(';
	command += `'${element.tagName.toLowerCase()}', {`;

	Array.from(element.attributes).forEach((attr, index) => {
		command += `'${attr.name}': '${attr.value}'`;
		if (index < element.attributes.length - 1) {
			command += ', ';
		}
	});

	command += '}, [';

	Array.from(element.children).forEach((child, index) => {
		if (child.nodeType === Node.ELEMENT_NODE) {
			command += parseHtml(child.outerHTML, depth + 1);
		} else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
			command += `'${child.textContent.trim()}'`;
		}
		if (index < element.children.length - 1) {
			command += ', ';
		}
	});

	command += '])';

	return command;
}

// // =================================================================
// // Pithml parser
// // =================================================================

function parsePithl(code) {
	let indentLevel = 0;
	let formattedCode = '';

	const indentString = '  '; // Set the indentation string (e.g., two spaces)

	// Helper function to add indentation
	function indent() {
		for (let i = 0; i < indentLevel; i++) {
			formattedCode += indentString;
		}
	}

	// Helper function to format attributes
	function formatAttributes(attributes) {
		const attributeKeys = Object.keys(attributes);
		const attributeString = attributeKeys.map((key) => `${key}="${attributes[key]}"`).join(' ');
		return attributeString;
	}

	// Helper function to format an element
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

	// Helper function to format a text node
	function formatText(text) {
		indent();
		formattedCode += text + '\n';
	}

	// Helper function to format a node (either an element or a text node)
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

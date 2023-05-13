// =================================================================
// Detect and format code when content is pasted into the input textarea
// =================================================================

document.addEventListener('DOMContentLoaded', function () {
	// Add an event listener for the paste event on the input element
	document.getElementById('input').addEventListener('paste', handlePaste);
});
// Event handler for the paste event
function handlePaste(event) {
	const inputElement = document.getElementById('input');
	const outputElement = document.getElementById('output');
	// Prevent the default paste behavior
	event.preventDefault();

	// Get the pasted text from the clipboard
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
	formatter(pastedText, 'input');

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
	console.log(formattedCode);
	document.getElementById(target).value = formattedCode;
}

function formatPithl(rawInput, target) {
	let indentLevel = 0;
	let formattedCode = '';
	let indentation = '  '; // Two spaces for indentation

	for (let i = 0; i < rawInput.length; i++) {
		const char = rawInput[i];

		if (char === '(') {
			formattedCode += '\n' + indentation.repeat(indentLevel) + char + '\n' + indentation.repeat(indentLevel + 1);
			indentLevel++;
		} else if (char === ')') {
			indentLevel--;
			formattedCode += '\n' + indentation.repeat(indentLevel) + char;
		} else if (char === ',') {
			formattedCode += char + '\n' + indentation.repeat(indentLevel);
		} else {
			formattedCode += char;
		}
	}

	document.getElementById(target).value = formattedCode;
}

// =================================================================
// html parser
// =================================================================
function parseHtml(html, depth = 0) {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	const element = template.content.firstChild;

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

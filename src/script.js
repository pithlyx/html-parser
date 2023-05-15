class Elem {
	constructor(tag, options = {}) {
		if (tag === '#text') {
			this.element = document.createTextNode(options.text);
		} else {
			this.element = document.createElement(tag);
			if (options.attrs) {
				for (const [attr, value] of Object.entries(options.attrs)) {
					if (attr === 'text') {
						this.element.textContent = value;
					} else {
						this.element.setAttribute(attr, value);
					}
				}
			}
			if (options.classes) {
				this.element.classList.add(...options.classes);
			}
		}

		if (options.children) {
			for (const child of options.children) {
				this.element.appendChild(child.element);
			}
		}
	}

	append(child) {
		this.element.appendChild(child.element);
		return this;
	}

	static createTextNode(text) {
		return new Elem('#text', { text });
	}

	setInnerHTML(html) {
		this.element.innerHTML = html;
		return this;
	}

	toHTML() {
		const tempElement = document.createElement('div');
		tempElement.appendChild(this.element.cloneNode(true));
		return tempElement.innerHTML;
	}
}

function parseHTML(markup) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(markup, 'text/html');
	const rootElement = doc.body.firstChild;

	function parseElement(element) {
		const { tagName, attributes } = element;
		const options = { attrs: {} };

		for (const { name, value } of attributes) {
			if (name === 'class') {
				options.classes = value.split(' ');
			} else {
				options.attrs[name] = value;
			}
		}

		const children = Array.from(element.childNodes)
			.filter((child) => child.nodeType === Node.ELEMENT_NODE)
			.map(parseElement);

		return new Elem(tagName, { ...options, children });
	}

	return parseElement(rootElement);
}
const html = `
  <div class="container">
    <div id="inputContainer">
      <textarea id="input" placeholder="Enter text"></textarea>
      <button id="submit" class="btn">
        <strong>Submit</strong>
        <br>
        Button
      </button>
    </div>
    <div id="outputContainer">
      <textarea id="output" placeholder="Output"></textarea>
      <button id="copy" class="btn">Copy</button>
    </div>
  </div>
`;

const parsedElement = parseHTML(html);
console.log(parsedElement);

document.addEventListener('DOMContentLoaded', createNew);
async function createNew() {
	const html = `
  <div class="container">
    <div id="inputContainer">
      <textarea id="input" placeholder="Enter text"></textarea>
      <button id="submit" class="btn">
        <strong>Submit</strong>
        <br>
        Button
      </button>
    </div>
    <div id="outputContainer">
      <textarea id="output" placeholder="Output"></textarea>
      <button id="copy" class="btn">Copy</button>
    </div>
  </div>
`;

	const parsedElement = parseHTML(html);
	console.log(parsedElement);
	// const html = await container.toHTML();
	// if (document.body) {
	// 	document.body.appendChild(container.element);
	// 	console.log(html);
	// } else {
	// 	console.error('document.body is null or undefined');
	// }
}

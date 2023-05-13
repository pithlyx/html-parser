function domBuilder(tag, attributes, children) {
	const element = document.createElement(tag);

	if (attributes) {
		Object.assign(element, attributes);
	}

	if (children) {
		children.forEach((child) => {
			if (typeof child === 'string') {
				element.appendChild(document.createTextNode(child));
			} else if (child instanceof HTMLElement) {
				element.appendChild(child);
			} else {
				console.error('Invalid child:', child);
			}
		});
	}

	return element;
}

// Usage example:
const div = domBuilder('div', { id: 'myDiv', className: 'container' }, [
	domBuilder('h1', { innerText: 'Hello, World!' }),
	domBuilder('a', { href: 'https://example.com', innerText: 'Visit example.com' }),
]);

document.body.appendChild(div);

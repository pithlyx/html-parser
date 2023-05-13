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

	if (depth === 0) {
		console.log(command);
	}

	return command;
}

// Usage example:
const htmlString = `
  <div id="myDiv" class="container">
    <div id="wrapper">
      <div class="test">
        <div title="p-div">
          <p>test</p>
        </div>
      </div>
    </div>
  </div>
`;

parseHtml(htmlString);

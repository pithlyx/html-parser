async function parseHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(doc.body.children);

  async function parseElement(element, indent = '') {
    const tag = element.tagName.toLowerCase();

    // Process attributes
    const attrs = {};
    let classes = [];
    const attributes = element.attributes;
    if (attributes.length > 0) {
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name === 'class') {
          classes = attr.value.split(/\s+/);
        } else {
          attrs[attr.name] = attr.value;
        }
      }
    }

    // Process children
    const children = [];
    let child = element.firstChild;
    while (child) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childCode = await parseElement(child, indent + '  '); // Await the recursive call
        children.push(childCode);
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) {
          children.push(`Elem.createTextNode('${text}')`);
        }
      }
      child = child.nextSibling;
    }

    const options = {
      attrs: Object.keys(attrs).length > 0 ? JSON.stringify(attrs) : null,
      classes: classes.length > 0 ? JSON.stringify(classes) : null,
    };

    const optionsString = Object.entries(options)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => `'${key}': ${value}`)
      .join(', ');

    if (children.length > 0) {
      const childrenString = children.join(`,\n${indent}  `);
      return `new Elem('${tag}', { ${optionsString} }, [\n${indent}  ${childrenString}\n${indent}])`;
    } else {
      return `new Elem('${tag}', { ${optionsString} })`;
    }
  }

  const parsedCodePromises = elements.map((element) => parseElement(element)); // Get an array of promises
  const parsedCodeArray = await Promise.all(parsedCodePromises); // Await all the promises
  const parsedCode = parsedCodeArray.join(',\n');
  return parsedCode;
}

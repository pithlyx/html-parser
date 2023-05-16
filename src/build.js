class Elem {
  constructor(tag, options = {}, children = []) {
    if (tag === '#text') {
      this.element = document.createTextNode(options.text);
    } else {
      this.element = document.createElement(tag);
      if (options.attrs) {
        for (const [attr, value] of Object.entries(options.attrs)) {
          this.element.setAttribute(attr, value);
        }
      }
      if (options.classes) {
        this.element.classList.add(...options.classes);
      }
    }

    for (const child of children) {
      this.element.appendChild(child.element);
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
    return this.element.outerHTML || this.element.textContent;
  }
}

interface ParsedSelector {
  tag: string;
  type: string; // "." or "#"
  value: string;
}

interface ElementWithClassList extends Element {
  classList: DOMTokenList;
}

(function (prototype: Element) {
  if (typeof prototype.closest === "function") return;

  function parseSimpleSelector(selector: string): ParsedSelector {
    let tag = "";
    let type = ""; // "." or "#"
    let value = "";

    for (let i = 0; i < selector.length; i++) {
      const ch = selector.charAt(i);

      if (ch === "." || ch === "#") {
        tag = selector.slice(0, i).toLowerCase();
        type = ch;
        value = selector.slice(i + 1);
        return { tag, type, value };
      }
    }

    tag = selector.toLowerCase();
    return { tag, type: "", value: "" };
  }

  function matchesSimple(el: Element | null, parsed: ParsedSelector): boolean {
    if (!el || el.nodeType !== 1) return false;

    if (parsed.tag !== "" && el.tagName.toLowerCase() !== parsed.tag) {
      return false;
    }

    if (parsed.type === ".") {
      if (
        !(el as ElementWithClassList).classList ||
        !(el as ElementWithClassList).classList.contains(parsed.value)
      ) {
        return false;
      }
    } else if (parsed.type === "#") {
      if (el.id !== parsed.value) return false;
    }

    return true;
  }

  prototype.closest = function (this: Element, selector: string): Element | null {
    let el: Element | null = this;
    const parsed: ParsedSelector = parseSimpleSelector(selector);

    while (el) {
      if (matchesSimple(el, parsed)) return el;
      el = el.parentElement;
    }

    return null;
  };
})(Element.prototype);

export { };

import DOMPurify from "dompurify";
import { MarkdownElementType } from "./markdownInput.types";

const ALLOWED_TAGS = [
  "p",
  "strong",
  "em",
  "code",
  "a",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];
const ALLOWED_ATTR = ["href", "title"];

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
};

const CLASS_NAME = {
  "markdown-input": {
    wrapper: "wrapper",
    toolbar: "toolbar",
    button: "button",
    input: "textarea",
    inputWrapper: "input-wrapper",
    inputPlaceholder: "placeholder",
    inputError: "error",
  }
}

class MarkdownInjector {
  private static insertText(text: string, html?: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Use modern Clipboard API if available
    if (navigator.clipboard && html) {
      // For HTML insertion, fallback to manual DOM manipulation
      const fragment = document.createDocumentFragment();
      const div = document.createElement("div");
      div.innerHTML = html;

      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }

      range.insertNode(fragment);
    } else {
      // Fallback for text insertion
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  static inject(
    type: MarkdownElementType,
    selectedText: string,
    renderMarkdown: boolean,
  ): void {
    const patterns = this.getPatterns();
    const pattern = (
      patterns as Record<string, (typeof patterns)[keyof typeof patterns]>
    )[type];

    if (!pattern) return;

    const { markdown, html } = pattern(selectedText);

    if (renderMarkdown && html) {
      const sanitizedHtml = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
      this.insertText(markdown, sanitizedHtml);
    } else {
      this.insertText(markdown);
    }
  }

  private static getPatterns() {
    return {

      bold: (text: string) => ({
        markdown: text ? `**${text}**` : "****",
        html: text ? `<strong>${text}</strong>` : "<strong></strong>",
      }),

      italic: (text: string) => ({
        markdown: text ? `*${text}*` : "**",
        html: text ? `<em>${text}</em>` : "<em></em>",
      }),

      code: (text: string) => {
        if (text && text.includes("\n")) {
          return {
            markdown: `\`\`\`\n${text}\n\`\`\``,
            html: `<pre><code>${text}</code></pre>`,
          };
        }
        return {
          markdown: text ? `\`${text}\`` : "``",
          html: text ? `<code>${text}</code>` : "<code></code>",
        };
      },

      heading: (text: string) => ({
        markdown: text ? `# ${text}` : "# ",
        html: text ? `<h1>${text}</h1>` : "<h1></h1>",
      }),

      blockquote: (text: string) => ({
        markdown: text ? `> ${text.split("\n").join("\n> ")}` : "> ",
        html: text
          ? `<blockquote><p>${text}</p></blockquote>`
          : "<blockquote><p></p></blockquote>",
      }),

      link: (text: string) => {
        // Use a more user-friendly prompt or parameter
        const url = "#"; // Default URL, should be handled by parent component
        return {
          markdown: text ? `[${text}](${url})` : `[](${url})`,
          html: text ? `<a href="${url}">${text}</a>` : `<a href="${url}"></a>`,
        };
      },

      image: (text: string) => {
        // Use a more user-friendly approach or parameter
        const url = "#"; // Default URL, should be handled by parent component
        const alt = text || "Image";
        return {
          markdown: `![${alt}](${url})`,
          html: `<img src="${url}" alt="${alt}" />`,
        };
      },

      list: (text: string) => ({
        markdown: text
          ? text
            .split("\n")
            .map((line) => `- ${line}`)
            .join("\n")
          : "- ",
        html: text
          ? `<ul>${text
            .split("\n")
            .map((line) => `<li>${line}</li>`)
            .join("")}</ul>`
          : "<ul><li></li></ul>",
      }),

      horizontalRule: () => ({
        markdown: "---",
        html: "<hr />",
      }),

      table: () => ({
        markdown: "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |",
        html: "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>",
      }),
    };
  }
}

export default MarkdownInjector;
export { ALLOWED_TAGS, ALLOWED_ATTR, DOMPURIFY_CONFIG };

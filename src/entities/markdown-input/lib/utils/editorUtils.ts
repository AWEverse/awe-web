import { MarkdownElementType } from "../markdownInput.types";

/**
 * Generates markdown text based on element type and content
 */
export const generateMarkdown = (type: MarkdownElementType, text: string): string => {
  switch (type) {
    case "bold":
      return `**${text}**`;
    case "italic":
      return `*${text}*`;
    case "code":
      return text.includes("\n") ? `\`\`\`\n${text}\n\`\`\`` : `\`${text}\``;
    case "heading":
      return `# ${text}`;
    case "blockquote":
      return `> ${text.split("\n").join("\n> ")}`;
    case "list":
    case "listItem":
      return text ? text.split("\n").map(line => `- ${line}`).join("\n") : "- ";
    case "horizontalRule":
      return "---";
    case "mention":
      return `@${text}`;
    case "hashtag":
      return `#${text}`;
    case "emoji":
      return `:${text}:`;
    case "table":
      return "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |";
    case "link": {
      const url = prompt("Enter URL:") || "#";
      return `[${text}](${url})`;
    }
    case "image": {
      const url = prompt("Enter image URL:") || "#";
      const alt = text || "Image";
      return `![${alt}](${url})`;
    }
    default:
      return text;
  }
};

/**
 * Inserts text at the current cursor position
 */
export const insertTextAtCursor = (text: string): boolean => {
  try {
    if (document.queryCommandSupported("insertText")) {
      return document.execCommand("insertText", false, text);
    } else {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        selection.collapseToEnd();
        return true;
      }
    }
  } catch (error) {
    console.warn("Failed to insert text at cursor:", error);
  }
  return false;
};

/**
 * Inserts HTML at the current cursor position
 */
export const insertHtmlAtCursor = (html: string): boolean => {
  try {
    if (document.queryCommandSupported("insertHTML")) {
      return document.execCommand("insertHTML", false, html);
    } else {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = temp.firstChild)) {
          frag.appendChild(node);
        }
        range.deleteContents();
        range.insertNode(frag);
        selection.collapseToEnd();
        return true;
      }
    }
  } catch (error) {
    console.warn("Failed to insert HTML at cursor:", error);
  }
  return false;
};

/**
 * Gets plain text from HTML element
 */
export const getPlainText = (el: HTMLElement): string => {
  return el.innerText || el.textContent || "";
};

/**
 * Checks if the given markdown type allows empty selection
 */
export const allowsEmptySelection = (type: MarkdownElementType): boolean => {
  return ["horizontalRule", "table", "list"].includes(type);
};

/**
 * Gets current selection information
 */
export const getCurrentSelection = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  return {
    text: selection.toString(),
    range: selection.getRangeAt(0),
    selection
  };
};

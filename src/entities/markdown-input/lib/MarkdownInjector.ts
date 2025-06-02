import { MarkdownElementType } from "@/shared/markdown/public/MarkdownTypes";
import MarkdownProcessor from "./MarkdownProcessor";

class MarkdownInjector {
  static inject(
    type: MarkdownElementType,
    text: string,
    from: number,
    to: number,
    renderMarkdown: boolean = true,
  ): { innerText: string; innerHTML: string } {
    const selectedText = text.slice(from, to);
    let newText = text;
    let replacement = "";

    switch (type) {
      case "bold":
        replacement = selectedText ? `**${selectedText}**` : "";
        break;
      case "italic":
        replacement = selectedText ? `*${selectedText}*` : "";
        break;
      case "code":
        replacement = selectedText ? `\`${selectedText}\`` : "";
        break;
      case "link":
        replacement = selectedText
          ? `[${selectedText}](url)`
          : "";
        break;
      case "heading1":
        replacement = selectedText ? `# ${selectedText}` : "";
        break;
      case "heading2":
        replacement = selectedText ? `## ${selectedText}` : "";
        break;
      case "heading3":
        replacement = selectedText ? `### ${selectedText}` : "";
        break;
      case "heading4":
        replacement = selectedText ? `#### ${selectedText}` : "";
        break;
      case "heading5":
        replacement = selectedText ? `##### ${selectedText}` : "";
        break;
      case "heading6":
        replacement = selectedText ? `###### ${selectedText}` : "";
        break;
      default:
        replacement = selectedText;
    }

    console.log("Reaplacement:", replacement)

    newText = text.slice(0, from) + replacement + text.slice(to);

    console.log("New text:", newText)

    return {
      innerText: newText,
      innerHTML: renderMarkdown
        ? MarkdownProcessor.markdownToHtml(newText)
        : newText,
    };
  }
}


export default MarkdownInjector;

import DOMPurify from "dompurify";

export default function handlePaste(
  e: React.ClipboardEvent<HTMLDivElement>,
): void {
  e.preventDefault();

  const pastedText = DOMPurify.sanitize(
    e.clipboardData.getData("text/plain"),
  ).trim();
  if (!pastedText) return;

  const selection = window.getSelection?.();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(pastedText));
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

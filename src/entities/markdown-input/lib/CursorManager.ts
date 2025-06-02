class CursorManager {
  static getSelectedRange(element: HTMLElement): [number, number] {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return [0, 0];

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    const start = preCaretRange.toString().length;
    const end = start + range.toString().length;

    return [start, end];
  }

  static getCursorPosition(element: HTMLElement): number {
    const [start] = this.getSelectedRange(element);
    return start;
  }

  static setCursorPosition(element: HTMLElement, position: number): void {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    let currentPos = 0;
    let walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    let node;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const textLength = textNode.textContent?.length || 0;

      if (currentPos + textLength >= position) {
        range.setStart(textNode, position - currentPos);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      currentPos += textLength;
    }

    // Fallback: set cursor at end
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  static getSelectedText(): string {
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
  }
}

export default CursorManager;

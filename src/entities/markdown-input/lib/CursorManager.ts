class CursorManager {
  static getCursorPosition(element: HTMLElement): number {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  }

  static setCursorPosition(element: HTMLElement, position: number): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let currentPosition = 0;
    let targetNode: Node | null = null;
    let targetOffset = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const nodeLength = node.textContent?.length || 0;

      if (currentPosition + nodeLength >= position) {
        targetNode = node;
        targetOffset = position - currentPosition;
        break;
      }

      currentPosition += nodeLength;
    }

    if (targetNode) {
      const range = document.createRange();
      const selection = window.getSelection();

      try {
        range.setStart(
          targetNode,
          Math.min(targetOffset, targetNode.textContent?.length || 0),
        );
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (error) {
        // Fallback: position at the end of element
        this.setEndPosition(element);
      }
    } else {
      this.setEndPosition(element);
    }
  }

  static setEndPosition(element: HTMLElement): void {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  static getSelectedText(): string {
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
  }
}

export default CursorManager;

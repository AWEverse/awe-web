class HistoryManager {
  private history: Array<{ content: string; cursorPosition: number }> = [];
  private currentIndex = -1;
  private maxHistorySize = 50;
  private lastSaveTime = 0;
  private minSaveInterval = 1000; // 1 second

  canSave(content: string, lastContent: string): boolean {
    const now = Date.now();
    const timePassed = now - this.lastSaveTime > this.minSaveInterval;
    const contentChanged = content !== lastContent;
    return timePassed && contentChanged;
  }

  save(content: string, cursorPosition: number): void {
    this.lastSaveTime = Date.now();

    // Remove any history after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push({ content, cursorPosition });
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): { content: string; cursorPosition: number } | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo(): { content: string; cursorPosition: number } | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}

export default HistoryManager;

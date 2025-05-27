const HISTORY_LIMIT = 50;
const HISTORY_DEBOUNCE_THRESHOLD = 3;

interface HistoryState {
  content: string;
  cursorPosition: number;
  timestamp: number;
}

class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private lastSaveTime = 0;
  private readonly minSaveInterval = 300; // 300ms between saves

  canSave(content: string, currentContent: string): boolean {
    const now = Date.now();
    const timePassed = now - this.lastSaveTime > this.minSaveInterval;
    const significantChange =
      Math.abs(content.length - currentContent.length) >
      HISTORY_DEBOUNCE_THRESHOLD;

    return timePassed && significantChange;
  }

  save(content: string, cursorPosition: number): void {
    const now = Date.now();

    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }

    this.history.push({
      content,
      cursorPosition,
      timestamp: now,
    });

    this.currentIndex = this.history.length - 1;
    this.lastSaveTime = now;

    if (this.history.length > HISTORY_LIMIT) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): HistoryState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo(): HistoryState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  initialize(content: string, cursorPosition: number): void {
    if (this.history.length === 0) {
      this.save(content, cursorPosition);
    }
  }
}

export default HistoryManager;
export type { HistoryState };

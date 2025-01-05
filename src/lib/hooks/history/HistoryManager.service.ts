import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import { partition } from '@/lib/utils/iteratees';
import { IS_IOS } from '@/lib/core';

type HistoryRecord = {
  index: number;
  // Should this record be replaced by the next record (for example Menu)
  shouldBeReplaced?: boolean;
  // Set if the element is closed in the UI, but not in the real history
  isClosed?: boolean;
  // Mark this record as replaced by the next record. Only used to check if needed to perform effectBack
  markReplaced?: VoidFunction;
  onBack?: VoidFunction;
};

type HistoryOperationGo = {
  type: 'go';
  delta: number;
};

type HistoryOperationState<T extends any = any> = {
  type: 'pushState' | 'replaceState';
  data: T;
  hash?: string;
};

type HistoryOperation = HistoryOperationGo | HistoryOperationState;

class HistoryManager {
  private historyState: HistoryRecord[] = [];
  private historyCursor: number = 0;
  private deferredHistoryOperations: HistoryOperation[] = [];
  private deferredPopstateOperations: HistoryOperationState[] = [];
  private isAlteringHistory: boolean = false;
  private isSafariGestureAnimation: boolean = false;
  private historyUniqueSessionId: number = Number(new Date());

  private static readonly PATH_BASE = `${window.location.pathname}${window.location.search}`;
  private static readonly SAFARI_EDGE_BACK_GESTURE_LIMIT = 300 * window.devicePixelRatio;
  private static readonly SAFARI_EDGE_BACK_GESTURE_DURATION = 350;

  constructor() {
    this.resetHistory();
    this.setupEventListeners();
  }

  public pushState(state: HistoryOperationState) {
    this.deferredHistoryOperations.push(state);
  }

  public replaceState(state: HistoryOperationState) {
    this.deferredHistoryOperations.push(state);
  }

  // #v-ifndef IS_IOS
  private handleTouchStart = (event: TouchEvent) => {
    const x = event.touches[0].pageX;
    const windowWidth = window.innerWidth;

    if (
      x <= HistoryManager.SAFARI_EDGE_BACK_GESTURE_LIMIT ||
      x >= windowWidth - HistoryManager.SAFARI_EDGE_BACK_GESTURE_LIMIT
    ) {
      this.isSafariGestureAnimation = true;
    }
  };

  private handleTouchEnd = () => {
    let animationTimeout: NodeJS.Timeout | null = null;

    if (!this.isSafariGestureAnimation) {
      return;
    }

    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }

    animationTimeout = setTimeout(() => {
      this.isSafariGestureAnimation = false;
    }, HistoryManager.SAFARI_EDGE_BACK_GESTURE_DURATION);
  };
  // #v-endif

  private setupEventListeners() {
    // #v-ifndef IS_IOS
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('touchend', this.handleTouchEnd);
    // #v-endif
    window.addEventListener('popstate', this.handlePopstate);
  }

  private applyDeferredHistoryOperations() {
    const [goOperations, stateOperations] = partition(
      this.deferredHistoryOperations,
      op => op.type === 'go',
    ) as [HistoryOperationGo[], HistoryOperationState[]];

    this.deferredHistoryOperations = [];

    const goCount = goOperations.countBy(op => op.delta);

    if (goCount) {
      window.history.go(goCount);

      // If we have some `state` operations after the `go` operations, we need to wait until the popstate event
      // so the order of operations is correctly preserved
      if (stateOperations.length) {
        this.deferredPopstateOperations.push(...stateOperations);
        return;
      }
    }

    this.processStateOperations(stateOperations);
  }

  private processStateOperations(stateOperations: HistoryOperationState[]) {
    stateOperations.forEach(operation => {
      const { type, data, hash } = operation;
      const historyMethod = window.history[type];

      historyMethod(data, '', hash);
    });
  }

  private deferHistoryOperation(historyOperation: HistoryOperation) {
    if (!this.deferredHistoryOperations.length) {
      requestMeasure(() => this.applyDeferredHistoryOperations());
    }

    this.deferredHistoryOperations.push(historyOperation);
  }

  private resetHistory() {
    this.historyCursor = 0;
    this.historyState = [
      {
        index: 0,
        onBack: () => window.history.back(),
      },
    ];

    window.history.replaceState(
      { index: 0, historyUniqueSessionId: this.historyUniqueSessionId },
      '',
      HistoryManager.PATH_BASE,
    );
  }

  private cleanupClosed(alreadyClosedCount = 1) {
    let countClosed = alreadyClosedCount;

    for (let i = this.historyCursor - 1; i > 0; i--) {
      if (this.historyState[i].isClosed) {
        countClosed++;
      }
    }

    if (countClosed) {
      this.isAlteringHistory = true;
      this.deferHistoryOperation({
        type: 'go',
        delta: -countClosed,
      });
    }

    return countClosed;
  }

  private cleanupTrashedState() {
    // Navigation to previous page reload, state of which was trashed by reload
    let isAnimationDisabled = false;

    for (let i = this.historyState.length - 1; i > 0; i--) {
      if (this.historyState[i].isClosed) {
        continue;
      }

      // TODO[history]: probably we should not call this inside the loop
      if (!isAnimationDisabled && this.isSafariGestureAnimation) {
        isAnimationDisabled = true;
      }
      this.historyState[i].onBack?.();
    }

    this.resetHistory();
  }

  private handlePopstate = ({ state }: PopStateEvent) => {
    if (this.isAlteringHistory) {
      this.isAlteringHistory = false;

      if (this.deferredPopstateOperations.length) {
        this.processStateOperations(this.deferredPopstateOperations);
        this.deferredPopstateOperations = [];
      }

      return;
    }

    if (!state) {
      this.cleanupTrashedState();

      if (window.location.hash) {
        return;
      }
    }

    const { index, historyUniqueSessionId: previousUniqueSessionId } = state;

    if (previousUniqueSessionId !== this.historyUniqueSessionId) {
      this.cleanupTrashedState();
      return;
    }

    // New real history state matches the old virtual one. Not possible in theory, but in practice we have Safari
    if (index === this.historyCursor) {
      return;
    }

    if (index < this.historyCursor) {
      // Navigating back
      let alreadyClosedCount = 0;
      let isAnimationDisabled = false;

      for (let i = this.historyCursor; i > index - alreadyClosedCount; i--) {
        if (this.historyState[i].isClosed) {
          alreadyClosedCount++;
          continue;
        }

        // TODO[history]: probably we should not call this inside the loop
        if (!isAnimationDisabled && this.isSafariGestureAnimation) {
          isAnimationDisabled = true;
        }

        this.historyState[i].onBack?.();
      }

      const countClosed = this.cleanupClosed(alreadyClosedCount);
      this.historyCursor += index - this.historyCursor - countClosed;

      // Can happen when we have deferred a real back for some element (for example Menu), closed via UI,
      // pressed back button and caused a pushState.
      if (this.historyCursor < 0) {
        this.historyCursor = 0;
      }
    } else if (index > this.historyCursor) {
      // Forward navigation is not yet supported
      this.isAlteringHistory = true;

      this.deferHistoryOperation({
        type: 'go',
        delta: -(index - this.historyCursor),
      });
    }
  };
}

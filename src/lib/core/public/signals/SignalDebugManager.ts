import SignalsConfig from "./SignalsConfig";

/**
 * Enable or disable debug mode globally
 */
export function setSignalDebugMode(enabled: boolean) {
  SignalsConfig.debugMode = enabled;
}

// Diagnostic and debugging utilities with improved error handling
class SignalDebugManager {
  private activeSignals = new Map<string, any>();
  private subscriptionCount = 0;
  private warningLogged = new Set<string>();

  registerSignal(id: string, signal: any): void {
    if (SignalsConfig.debugMode) {
      this.activeSignals.set(id, {
        ...signal,
        createdAt: new Date(),
        stackTrace: new Error().stack
      });
      console.debug(`[Signals] Created: ${id}`);
    }
  }

  unregisterSignal(id: string): void {
    if (SignalsConfig.debugMode) {
      this.activeSignals.delete(id);
      console.debug(`[Signals] Disposed: ${id}`);
    }
  }

  logSubscription(signalId: string): void {
    if (SignalsConfig.debugMode) {
      this.subscriptionCount++;
      console.debug(`[Signals] New subscription to ${signalId} (total: ${this.subscriptionCount})`);
    }
  }

  logUnsubscription(signalId: string): void {
    if (SignalsConfig.debugMode) {
      this.subscriptionCount--;
      console.debug(`[Signals] Unsubscribed from ${signalId} (total: ${this.subscriptionCount})`);
    }
  }

  logWarning(id: string, message: string): void {
    const key = `${id}:${message}`;
    if (!this.warningLogged.has(key)) {
      console.warn(`[Signals] ${message} (${id})`);
      this.warningLogged.add(key);
    }
  }

  getStats(): { activeSignalCount: number; subscriptionCount: number; signalNames: string[] } {
    return {
      activeSignalCount: this.activeSignals.size,
      subscriptionCount: this.subscriptionCount,
      signalNames: Array.from(this.activeSignals.keys())
    };
  }

  // Memory leak detection
  checkForPotentialLeaks(): void {
    if (this.activeSignals.size > 1000) {
      console.warn(`[Signals] Potential memory leak detected: ${this.activeSignals.size} active signals`);
    }
  }
}

export default new SignalDebugManager();

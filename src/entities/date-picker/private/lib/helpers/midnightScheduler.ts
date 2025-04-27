import { EventEmitter } from "events";

class MidnightScheduler extends EventEmitter {
  private tick = 0;
  private interval: NodeJS.Timeout | null = null;
  private initialized = false;

  private calculateMsToMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.getTime() - now.getTime();
  }

  private scheduleTick() {
    const msToMidnight = this.calculateMsToMidnight();
    setTimeout(() => {
      this.interval = setInterval(() => {
        this.tick++;
        this.emit("tick", this.tick);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msToMidnight);
  }

  public initIfNeeded() {
    if (!this.initialized) {
      this.initialized = true;
      this.scheduleTick();
    }
  }

  public getTick() {
    return this.tick;
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

let instance: MidnightScheduler | null = null;
let instanceCount = 0;

export const getMidnightScheduler = (): MidnightScheduler => {
  if (!instance) {
    instance = new MidnightScheduler();
  }

  instanceCount++;

  return instance;
};

export const cleanupMidnightScheduler = () => {
  if (instanceCount > 0) {
    instanceCount--;
  }

  if (instanceCount === 0 && instance) {
    instance.stop();
    instance = null;
  }
};

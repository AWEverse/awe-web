import { EventEmitter } from "events";

class MidnightScheduler extends EventEmitter {
  private tick = 0;
  private timeout: NodeJS.Timeout | null = null;
  private initialized = false;

  private calculateMsToMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.getTime() - now.getTime();
  }

  private scheduleTick() {
    if (this.timeout) clearTimeout(this.timeout);

    const msToMidnight = this.calculateMsToMidnight();

    this.timeout = setTimeout(() => {
      this.tick++;
      this.emit("tick", { tick: this.tick });
      this.scheduleTick(); // reschedule next
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
}

let instance: MidnightScheduler | null = null;

export const getMidnightScheduler = (): MidnightScheduler => {
  if (!instance) {
    instance = new MidnightScheduler();
  }
  return instance;
};

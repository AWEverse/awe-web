import { EventEmitter } from "events";

class MidnightScheduler extends EventEmitter {
  private tick = 0;
  private interval: NodeJS.Timeout | null = null;
  private lastCalculatedTime: number = Date.now();

  constructor() {
    super();
    this.scheduleNextTick();
  }

  private calculateMsToMidnight(): number {
    const now = new Date();
    const lastTime = this.lastCalculatedTime;
    this.lastCalculatedTime = now.getTime();

    if (now.getTime() < lastTime) {
      console.warn("Время на устройстве было изменено назад. Пересчитываем время.");
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return tomorrow.getTime() - now.getTime();
  }

  private scheduleNextTick(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    const msToMidnight = this.calculateMsToMidnight();

    this.interval = setTimeout(() => {
      this.tick++;
      this.emit("tick", this.tick);

      this.interval = setInterval(() => {
        this.tick++;
        this.emit("tick", this.tick);
      }, 24 * 60 * 60 * 1000);
    }, msToMidnight);
  }

  public getTick(): number {
    return this.tick;
  }

  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}


let instance: MidnightScheduler | null = null;

export const getMidnightScheduler = (): MidnightScheduler => {
  if (!instance) {
    instance = new MidnightScheduler();
  }
  return instance;
};

export const cleanupMidnightScheduler = () => {
  if (instance) {
    instance.stop();
    instance = null;
  }
};

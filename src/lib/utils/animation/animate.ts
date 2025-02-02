import { Scheduler } from "@/lib/core";

export function animate(schedulerFn: Scheduler, tick: () => any) {
  const frame = () => {
    if (tick()) {
      schedulerFn(frame);
    }
  };

  schedulerFn(frame);
}

export function animateInstantly(schedulerFn: Scheduler, tick: () => any) {
  const frame = () => {
    if (tick()) {
      schedulerFn(frame);
    }
  };

  if (tick()) {
    schedulerFn(frame);
  }
}

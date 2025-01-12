import { Scheduler } from '@/lib/core';

export function animate(schedulerFn: Scheduler, tick: NoneToAnyFunction) {
  schedulerFn(() => {
    if (tick()) {
      animate(schedulerFn, tick);
    }
  });
}

export function animateInstantly(schedulerFn: Scheduler, tick: NoneToAnyFunction) {
  if (tick()) {
    schedulerFn(() => {
      animateInstantly(schedulerFn, tick);
    });
  }
}

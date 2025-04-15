import {
  signal,
  computed,
  effect,
  batch,
  untracked,
  reactiveObject,
  watch,
  safeExecute,
} from './SignalsCore';

describe('SignalsCore', () => {
  describe('signal', () => {
    it('creates signal with initial value', () => {
      const sig = signal(10);
      expect(sig.value).toBe(10);
    });

    it('updates signal value', () => {
      const sig = signal(10);
      sig.value = 20;
      expect(sig.value).toBe(20);
    });

    it('notifies subscribers on value change', () => {
      const sig = signal(10);
      const fn = jest.fn();
      const unsubscribe = sig.subscribe(fn);
      sig.value = 20;
      expect(fn).toHaveBeenCalledWith(20);
      unsubscribe();
    });

    it('skips notification for same value', () => {
      const sig = signal(10);
      const fn = jest.fn();
      sig.subscribe(fn);
      sig.value = 10;
      expect(fn).not.toHaveBeenCalled();
    });

    it('handles multiple subscribers', () => {
      const sig = signal(10);
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const u1 = sig.subscribe(fn1);
      const u2 = sig.subscribe(fn2);
      sig.value = 20;
      expect(fn1).toHaveBeenCalledWith(20);
      expect(fn2).toHaveBeenCalledWith(20);
      u1();
      u2();
    });

    it('peeks value without dependency', () => {
      const sig = signal(10);
      expect(sig.peek()).toBe(10);
    });

    it('does not notify subscribers on peek', () => {
      const sig = signal(10);
      const fn = jest.fn();
      sig.subscribe(fn);
      sig.peek();
      expect(fn).not.toHaveBeenCalled();
    });

    it('converts to string', () => {
      const sig = signal(10);
      expect(sig.toString()).toBe('10');
    });

    it('converts to JSON', () => {
      const sig = signal({ key: 'value' });
      expect(sig.toJSON()).toEqual({ key: 'value' });
    });

    it('creates dependency in effect', () => {
      const sig = signal(10);
      let node;
      const dispose = effect(() => {
        sig.value;
        node = addDependency(sig);
      });
      expect(node).toBeDefined();
      expect(node._version).toBe(0);
      dispose();
    });

    it('handles MAX_INT32 version rollover', () => {
      const sig = signal(10);
      sig._version = 2 ** 31 - 1; // MAX_INT32
      sig.value = 20;
      expect(sig._version).toBe(1);
    });
  });

  describe('computed', () => {
    it('computes initial value', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a.value * b.value);
      expect(c.value).toBe(6);
    });

    it('recomputes on dependency change', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a.value * b.value);
      a.value = 4;
      expect(c.value).toBe(12);
    });

    it('lazily subscribes to dependencies', () => {
      const a = signal(2);
      const c = computed(() => a.value * 2);
      expect(c._targets).toBeUndefined();
      c.value;
      expect(c._targets).toBeDefined();
    });

    it('avoids recomputation if dependencies unchanged', () => {
      const a = signal(2);
      const fn = jest.fn(() => a.value * 2);
      const c = computed(fn);
      c.value;
      c.value;
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('handles errors', () => {
      const a = signal(2);
      const c = computed(() => {
        if (a.value > 1) throw new Error('Test error');
        return a.value;
      });
      expect(() => c.value).toThrow('Test error');
    });

    it('detects cycles', () => {
      const a = signal(1);
      const b = computed(() => a.value + c.value);
      const c = computed(() => b.value + 1);
      expect(() => c.value).toThrow('Cycle detected');
    });
  });

  describe('effect', () => {
    it('runs on dependency change', () => {
      const a = signal(1);
      const fn = jest.fn(() => a.value);
      const dispose = effect(fn);
      a.value = 2;
      expect(fn).toHaveBeenCalledTimes(2);
      dispose();
    });

    it('executes cleanup before re-run', () => {
      const a = signal(1);
      const cleanup = jest.fn();
      const fn = jest.fn(() => {
        a.value;
        return cleanup;
      });
      const dispose = effect(fn);
      a.value = 2;
      expect(cleanup).toHaveBeenCalledTimes(1);
      dispose();
    });

    it('disposes correctly', () => {
      const a = signal(1);
      const fn = jest.fn(() => a.value);
      const dispose = effect(fn);
      dispose();
      a.value = 2;
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('handles errors without breaking', () => {
      const a = signal(1);
      const fn = jest.fn(() => {
        if (a.value > 1) throw new Error('Test error');
        return a.value;
      });
      const dispose = effect(fn);
      expect(() => {
        a.value = 2;
      }).not.toThrow();
      expect(fn).toHaveBeenCalledTimes(2);
      dispose();
    });
  });

  describe('batch', () => {
    it('batches updates', () => {
      const sig = signal(10);
      const fn = jest.fn();
      sig.subscribe(fn);
      batch(() => {
        sig.value = 20;
        sig.value = 30;
      });
      expect(fn).toHaveBeenCalledTimes(2);
      expect(sig.value).toBe(30);
    });

    it('handles nested batches', () => {
      const sig = signal(10);
      const fn = jest.fn();
      sig.subscribe(fn);
      batch(() => {
        sig.value = 20;
        batch(() => {
          sig.value = 30;
        });
        sig.value = 40;
      });
      expect(fn).toHaveBeenCalledTimes(3);
      expect(sig.value).toBe(40);
    });

    it('reflects updates immediately in batch', () => {
      const sig = signal(10);
      let value;
      batch(() => {
        sig.value = 20;
        value = sig.value;
      });
      expect(value).toBe(20);
    });

    it('throws on excessive iterations', () => {
      const a = signal(0);
      const b = computed(() => a.value + 1);
      expect(() => {
        batch(() => {
          for (let i = 0; i < 1001; i++) a.value = i;
        });
      }).toThrow('Maximum batch iteration limit reached');
    });
  });

  describe('untracked', () => {
    it('accesses value without dependency', () => {
      const sig = signal(10);
      const result = untracked(() => sig.value + 10);
      expect(result).toBe(20);
    });

    it('prevents dependency creation', () => {
      const sig = signal(10);
      let node;
      const dispose = effect(() => {
        untracked(() => {
          sig.value;
          node = addDependency(sig);
        });
      });
      expect(node).toBeUndefined();
      dispose();
    });
  });

  describe('reactiveObject', () => {
    it('creates signals for object properties', () => {
      const obj = reactiveObject({ a: 1, b: { c: 2 } });
      expect(obj.a.value).toBe(1);
      expect(obj.b.value.c.value).toBe(2);
    });

    it('tracks changes with callback', () => {
      const fn = jest.fn();
      const obj = reactiveObject({ a: 1 }, { callback: fn });
      obj.a.value = 2;
      console.log(obj)

      expect(fn).toHaveBeenCalledWith(['a'], 2);
    });

    it('handles arrays', () => {
      const arr = reactiveObject({ list: [1, 2] });
      expect(arr.list.value[0]).toBe(1);
      expect(arr.list.value[1]).toBe(2);
    });

    it('respects glob patterns', () => {
      const fn = jest.fn();
      const obj = reactiveObject({ a: { b: 1, c: 2 } }, { trackPatterns: ['a.b'], callback: fn });
      obj.a.value.b.value = 3;
      obj.a.value.c.value = 4;
      expect(fn).toHaveBeenCalledWith(['a', 'b'], 3);
      expect(fn).not.toHaveBeenCalledWith(['a', 'c'], 4);
    });

    it('throws on invalid patterns', () => {
      expect(() => reactiveObject({ a: 1 }, { trackPatterns: ['**.*'] }))
        .toThrow('Invalid track pattern');
    });
  });

  describe('watch', () => {
    it('triggers callback on value change', () => {
      const sig = signal(10);
      const fn = jest.fn();
      const dispose = watch(sig, fn);
      sig.value = 20;
      expect(fn).toHaveBeenCalledWith(20, 10);
      dispose();
    });

    it('skips same value', () => {
      const sig = signal(10);
      const fn = jest.fn();
      const dispose = watch(sig, fn);
      sig.value = 10;
      expect(fn).not.toHaveBeenCalled();
      dispose();
    });
  });

  describe('safeExecute', () => {
    it('executes function safely', () => {
      const result = safeExecute(() => 42);
      expect(result).toBe(42);
    });

    it('handles errors with custom handler', () => {
      const fn = jest.fn();
      const result = safeExecute(() => { throw new Error('Test'); }, fn);
      expect(fn).toHaveBeenCalledWith(expect.any(Error));
      expect(result).toBeUndefined();
    });
  });

  describe('Performance and Limits', () => {
    it('handles many signals', () => {
      const signals = Array(1000).fill(0).map(() => signal(0));
      const computed = signals.map(s => computed(() => s.value * 2));
      computed.forEach(c => c.value);
      signals.forEach(s => s.value = 1);
      computed.forEach(c => expect(c.value).toBe(2));
    });

    it('prevents excessive recursion', () => {
      const a = signal(0);
      const dispose = effect(() => {
        a.value;
        a.value = a.value + 1;
      });
      expect(() => a.value = 101).toThrow('Maximum recursion depth exceeded');
      dispose();
    });
  });
});

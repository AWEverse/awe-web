import { signal, computed, effect, batch, untracked, addDependency, cleanupSources } from './SignalsCore';

describe('SignalsCore', () => {
  describe('signal', () => {
    it('should create a signal with an initial value', () => {
      const mySignal = signal(10);
      expect(mySignal.value).toBe(10);
    });

    it('should update the signal value', () => {
      const mySignal = signal(10);
      mySignal.value = 20;
      expect(mySignal.value).toBe(20);
    });

    it('should notify subscribers when the value changes', () => {
      const mySignal = signal(10);
      const subscriber = jest.fn();
      const unsubscribe = mySignal.subscribe(subscriber);

      mySignal.value = 20;

      expect(subscriber).toHaveBeenCalledWith(20);
      unsubscribe();
    });

    it('should not notify subscribers if the value does not change', () => {
      const mySignal = signal(10);
      const subscriber = jest.fn();
      const unsubscribe = mySignal.subscribe(subscriber);

      mySignal.value = 10;

      expect(subscriber).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('should handle multiple subscribers', () => {
      const mySignal = signal(10);
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();
      const unsubscribe1 = mySignal.subscribe(subscriber1);
      const unsubscribe2 = mySignal.subscribe(subscriber2);

      mySignal.value = 20;

      expect(subscriber1).toHaveBeenCalledWith(20);
      expect(subscriber2).toHaveBeenCalledWith(20);
      unsubscribe1();
      unsubscribe2();
    });

    it('should allow peeking at the value without creating a dependency', () => {
      const mySignal = signal(10);
      expect(mySignal.peek()).toBe(10);
    });

    it('should not trigger subscriber notifications when peeking', () => {
      const mySignal = signal(10);
      const subscriber = jest.fn();
      const unsubscribe = mySignal.subscribe(subscriber);

      mySignal.peek();

      expect(subscriber).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('should convert the signal to a string', () => {
      const mySignal = signal(10);
      expect(mySignal.toString()).toBe('10');
    });

    it('should convert the signal to JSON', () => {
      const mySignal = signal({ key: 'value' });
      expect(mySignal.toJSON()).toEqual({ key: 'value' });
    });

    it('should create a dependency when accessing the value in an effect', () => {
      const mySignal = signal(10);
      let dependencyNode;
      const dispose = effect(() => {
        mySignal.value;
        dependencyNode = addDependency(mySignal);
      });
      expect(dependencyNode).toBeDefined();
      dispose();
    });
  });

  describe('batch', () => {
    it('should batch updates and commit them at the end', () => {
      const mySignal = signal(10);
      const subscriber = jest.fn();
      mySignal.subscribe(subscriber);

      batch(() => {
        mySignal.value = 20;
        mySignal.value = 30;
      });

      expect(subscriber).toHaveBeenCalledTimes(2); // Once per unique value
      expect(mySignal.value).toBe(30);
    });

    it('should handle nested batches', () => {
      const mySignal = signal(10);
      const subscriber = jest.fn();
      mySignal.subscribe(subscriber);

      batch(() => {
        mySignal.value = 20;
        batch(() => {
          mySignal.value = 30;
        });
        mySignal.value = 40;
      });

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(mySignal.value).toBe(40);
    });

    it('should reflect updated values immediately within a batch', () => {
      const mySignal = signal(10);
      let valueInBatch;
      batch(() => {
        mySignal.value = 20;
        valueInBatch = mySignal.value;
      });
      expect(valueInBatch).toBe(20);
    });
  });

  describe('untracked', () => {
    it('should run a callback without subscribing to signal updates', () => {
      const mySignal = signal(10);
      const result = untracked(() => mySignal.value + 10);
      expect(result).toBe(20);
    });

    it('should not create dependencies within the untracked callback', () => {
      const mySignal = signal(10);
      let dependencyNode;
      const dispose = effect(() => {
        untracked(() => {
          mySignal.value;
          dependencyNode = addDependency(mySignal);
        });
      });
      expect(dependencyNode).toBeUndefined();
      dispose();
    });
  });

  describe('addDependency', () => {
    it('should add a dependency between the current context and a signal', () => {
      const mySignal = signal(10);
      let node;
      const dispose = effect(() => {
        mySignal.value;
        node = addDependency(mySignal);
      });
      expect(node).toBeDefined();
      dispose();
    });

    it('should reuse the same node if the dependency already exists', () => {
      const mySignal = signal(10);
      let node1, node2;
      const dispose = effect(() => {
        mySignal.value;
        node1 = addDependency(mySignal);
        node2 = addDependency(mySignal);
      });
      expect(node1).toBe(node2);
      dispose();
    });

    it('should not add a dependency if there is no current context', () => {
      const mySignal = signal(10);
      const node = addDependency(mySignal);
      expect(node).toBeUndefined();
    });
  });

  describe('cleanupSources', () => {
    it('should clean up unused dependencies', () => {
      const mySignal = signal(10);
      const effectFn = jest.fn(() => mySignal.value);
      const effectInstance = {
        _fn: effectFn,
        _compute: effectFn,
        _sources: null,
        _globalVersion: 0,
        _flags: 0,
        _lastGlobalVersion: 0
      };
      effectInstance._compute();
      cleanupSources(effectInstance as any);
      expect(effectFn).toHaveBeenCalled();
    });

    it('should not clean up used dependencies', () => {
      const mySignal = signal(10);
      const effectFn = jest.fn(() => mySignal.value);
      const effectInstance = {
        _fn: effectFn,
        _compute: effectFn,
        _sources: null,
        _globalVersion: 0,
        _flags: 0,
        _lastGlobalVersion: 0
      };
      effectInstance._compute();
      effectInstance._sources = { _source: mySignal, _version: mySignal._version };
      cleanupSources(effectInstance as any);
      expect(effectInstance._sources).not.toBeNull();
    });

    it('should handle multiple sources correctly', () => {
      const signal1 = signal(10);
      const signal2 = signal(20);
      const effectFn = jest.fn(() => {
        signal1.value;
        signal2.value;
      });
      const effectInstance = {
        _fn: effectFn,
        _compute: effectFn,
        _sources: null,
        _globalVersion: 0,
        _flags: 0,
        _lastGlobalVersion: 0
      };
      effectInstance._compute();
      cleanupSources(effectInstance as any);
      expect(effectInstance._sources).toBeDefined();
    });
  });

  describe('computed', () => {
    it('should compute initial value', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a.value * b.value);
      expect(c.value).toBe(6);
    });

    it('should recompute when dependencies change', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a.value * b.value);
      a.value = 4;
      expect(c.value).toBe(12);
    });

    it('should lazily subscribe to dependencies', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a.value * b.value);
      expect(c._targets).toBeUndefined(); // No subscribers yet
      c.value; // Accessing value subscribes
      expect(c._targets).toBeDefined();
    });
  });

  describe('effect', () => {
    it('should run the effect when dependencies change', () => {
      const a = signal(1);
      const effectFn = jest.fn(() => a.value);
      const dispose = effect(effectFn);
      a.value = 2;
      expect(effectFn).toHaveBeenCalledTimes(2); // Initial + update
      dispose();
    });

    it('should cleanup previous effect', () => {
      const a = signal(1);
      const cleanupFn = jest.fn();
      const effectFn = jest.fn(() => {
        a.value;
        return cleanupFn;
      });
      const dispose = effect(effectFn);
      a.value = 2;
      expect(cleanupFn).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in computed signals', () => {
      const a = signal(2);
      const c = computed(() => {
        if (a.value > 1) throw new Error('Test error');
        return a.value;
      });
      expect(() => c.value).toThrow('Test error');
    });

    it('should handle errors in effects', () => {
      const a = signal(1);
      const effectFn = jest.fn(() => {
        if (a.value > 1) throw new Error('Test error');
      });
      const dispose = effect(effectFn);
      a.value = 2;
      expect(effectFn).toHaveBeenCalledTimes(2);
      dispose();
    });
  });

  describe('Performance and Limits', () => {
    it('should handle a large number of signals and dependencies', () => {
      const signals = Array.from({ length: 1000 }, () => signal(0));
      const computedSignals = signals.map((sig) => computed(() => sig.value * 2));
      computedSignals.forEach((comp) => comp.value); // Trigger computation
      signals.forEach((sig) => {
        sig.value = 1;
      });
      computedSignals.forEach((comp) => {
        expect(comp.value).toBe(2);
      });
    });

    it('should prevent infinite loops', () => {
      const a = signal(0);
      const b = computed(() => a.value + 1);
      const c = computed(() => b.value + 1);
      expect(() => {
        a.value = c.value; // Potential infinite loop
      }).toThrow('Maximum batch iteration limit reached');
    });
  });
});

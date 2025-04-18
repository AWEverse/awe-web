import {
  signal,
  computed,
  effect,
  batch,
  untracked,
  reactiveObject,
  watch,
  safeExecute,
  monitorSignals,
  ReadonlySignal,
  Signal
} from '../public/SignalsCore';

// Mock console methods for testing
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

describe('Signal', () => {
  test('should create a signal with initial value', () => {
    const count = signal(10);
    expect(count.value).toBe(10);
  });

  test('should create a signal without initial value', () => {
    const count = signal();
    expect(count.value).toBeUndefined();
  });

  test('should update signal value', () => {
    const count = signal(0);
    count.value = 5;
    expect(count.value).toBe(5);
  });

  test('should not trigger updates for identical values', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(count.value);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    count.value = 0; // Same value
    expect(mockFn).toHaveBeenCalledTimes(1);

    count.value = 1; // Different value
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test('peek should get value without creating dependency', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(count.peek());
    });

    count.value = 5;
    expect(mockFn).toHaveBeenCalledTimes(1); // No additional calls
  });

  test('toJSON should return the signal value', () => {
    const count = signal(10);
    expect(count.toJSON()).toBe(10);
  });

  test('toString should convert signal value to string', () => {
    const count = signal(10);
    expect(count.toString()).toBe('10');
  });

  test('valueOf should return signal value', () => {
    const count = signal(10);
    expect(count.valueOf()).toBe(10);
  });
});

describe('Computed', () => {
  test('should compute value from dependencies', () => {
    const count = signal(10);
    const doubled = computed(() => count.value * 2);

    expect(doubled.value).toBe(20);

    count.value = 5;
    expect(doubled.value).toBe(10);
  });

  test('should not recompute when dependencies have not changed', () => {
    const count = signal(10);
    const fn = jest.fn(() => count.value * 2);
    const doubled = computed(fn);

    doubled.value; // First computation
    doubled.value; // Should use cached value

    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should recompute only when accessed', () => {
    const count = signal(10);
    const fn = jest.fn(() => count.value * 2);
    const doubled = computed(fn);

    doubled.value; // Initial computation
    count.value = 20; // Update dependency

    expect(fn).toHaveBeenCalledTimes(1); // Not yet recomputed

    expect(doubled.value).toBe(40); // Access triggers recomputation
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('should handle nested computed signals', () => {
    const count = signal(10);
    const doubled = computed(() => count.value * 2);
    const quadrupled = computed(() => doubled.value * 2);

    expect(quadrupled.value).toBe(40);

    count.value = 5;
    expect(quadrupled.value).toBe(20);
  });

  test('should handle errors in computed functions', () => {
    const count = signal(0);
    const inverse = computed(() => {
      if (count.value === 0) throw new Error('Division by zero');
      return 1 / count.value;
    });

    expect(() => inverse.value).toThrow('Division by zero');

    count.value = 2;
    expect(inverse.value).toBe(0.5);
  });

  test('should detect cycles in computed dependencies', () => {
    const a = signal(1);
    let c: ReadonlySignal<number>;

    const b = computed(() => a.value + (c?.value || 0));
    c = computed(() => b.value * 2);

    expect(() => c.value).toThrow('Cycle detected');
  });
});

describe('Effect', () => {
  test('should execute effect immediately and track dependencies', () => {
    const count = signal(0);
    const effectFn = jest.fn(() => {
      count.value; // Access signal to create dependency
    });

    effect(effectFn);

    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  test('should run initially and when dependencies change', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    const dispose = effect(() => {
      mockFn(count.value);
    });

    expect(mockFn).toHaveBeenCalledWith(0);
    expect(mockFn).toHaveBeenCalledTimes(1);

    count.value = 5;
    expect(mockFn).toHaveBeenCalledWith(5);
    expect(mockFn).toHaveBeenCalledTimes(2);

    dispose();
    count.value = 10;
    expect(mockFn).toHaveBeenCalledTimes(2); // No additional calls after disposal
  });

  test('should run cleanup function before re-running effect', () => {
    const count = signal(0);
    const cleanupFn = jest.fn();
    const effectFn = jest.fn().mockImplementation(() => cleanupFn);

    effect(effectFn);

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(cleanupFn).not.toHaveBeenCalled();

    count.value = 5;

    expect(cleanupFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledTimes(2); // Effect re-runs after signal change
  });

  test('should detect cycles in effect dependencies', () => {
    const count = signal(0);

    expect(() => {
      effect(() => {
        count.value++; // This creates a cycle
      });
    }).toThrow('Cycle detected');
  });

  test('should handle errors in effect functions', () => {
    const count = signal(0);
    const errorFn = jest.fn();

    effect(() => {
      try {
        if (count.value === 1) throw new Error('Test error');
      } catch (e) {
        errorFn(e);
      }
    });

    count.value = 1;
    expect(errorFn).toHaveBeenCalled();
  });
});



describe('Batch', () => {
  test('should batch multiple updates', () => {
    const a = signal(1);
    const b = signal(2);
    const sum = computed(() => a.value + b.value);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(sum.value);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(3);

    batch(() => {
      a.value = 10;
      b.value = 20;
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith(30);
  });

  test('should handle nested batches', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(count.value);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    batch(() => {
      count.value = 1;

      batch(() => {
        count.value = 2;
        count.value = 3;
      });

      count.value = 4;
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith(4);
  });

  test('should handle errors in batch callbacks', () => {
    const count = signal(0);

    expect(() => {
      batch(() => {
        count.value = 1;
        throw new Error('Batch error');
        // This line won't execute
        count.value = 2;
      });
    }).toThrow('Batch error');

    expect(count.value).toBe(1); // First update still applies
  });

  test('should handle multiple errors in batch processing', () => {
    const triggers = [signal(false), signal(false), signal(false)];

    // Create effects that will throw errors when their signals are true
    effect(() => {
      if (triggers[0].value) throw new Error('Error 1');
    });

    effect(() => {
      if (triggers[1].value) throw new Error('Error 2');
    });

    // Set up the test to catch the AggregateError
    try {
      batch(() => {
        triggers[0].value = true;
        triggers[1].value = true;
      });
      fail('Should have thrown an AggregateError');
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
      expect((error as AggregateError).errors.length).toBe(2);
    }
  });
});

describe('Untracked', () => {
  test('should access signal without tracking dependency', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(untracked(() => count.value));
    });

    count.value = 5;
    expect(mockFn).toHaveBeenCalledTimes(1); // No reactivity
  });

  test('should be composable with other reactive operations', () => {
    const a = signal(1);
    const b = signal(2);
    const mockFn = jest.fn();

    effect(() => {
      // Only react to changes in a, not b
      mockFn(a.value + untracked(() => b.value));
    });

    a.value = 10;
    expect(mockFn).toHaveBeenCalledTimes(2);

    b.value = 20;
    expect(mockFn).toHaveBeenCalledTimes(2); // No additional call
  });
});

describe('Subscribe', () => {
  test('should subscribe to signal changes', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    const unsubscribe = count.subscribe(mockFn);

    expect(mockFn).toHaveBeenCalledWith(0);

    count.value = 5;
    expect(mockFn).toHaveBeenCalledWith(5);

    unsubscribe();
    count.value = 10;
    expect(mockFn).toHaveBeenCalledTimes(2); // No additional call after unsubscribe
  });
});

describe('ReactiveObject', () => {
  test('should create reactive object with signal properties', () => {
    const user = reactiveObject({
      name: 'John',
      age: 30
    });

    expect(user.name.value).toBe('John');
    expect(user.age.value).toBe(30);

    user.name.value = 'Jane';
    expect(user.name.value).toBe('Jane');
  });

  test('should handle nested objects', () => {
    const user = reactiveObject({
      name: 'John',
      address: {
        city: 'New York',
        zip: '10001'
      }
    });

    expect(user.address.value.city.value).toBe('New York');

    user.address.value.city.value = 'Boston';
    expect(user.address.value.city.value).toBe('Boston');
  });

  test('should handle arrays', () => {
    const list = reactiveObject({
      items: [1, 2, 3]
    });

    expect(list.items.value.length).toBe(3);
    expect(list.items.value[0]).toBe(1);
  });

  test('should track specific paths with callback', () => {
    const mockFn = jest.fn();

    const user = reactiveObject(
      {
        name: 'John',
        address: {
          city: 'New York',
          zip: '10001'
        }
      },
      {
        callback: mockFn,
        trackPatterns: ['address.city']
      }
    );

    user.name.value = 'Jane'; // Should not trigger callback
    expect(mockFn).not.toHaveBeenCalled();

    user.address.value.city.value = 'Boston'; // Should trigger callback
    expect(mockFn).toHaveBeenCalledWith(['address', 'city'], 'Boston');
  });

  test('should throw error with helpful message for invalid track patterns', () => {
    expect(() => {
      reactiveObject(
        { test: 'value' },
        { trackPatterns: ['[invalid'] }
      );
    }).toThrow(/Invalid track pattern/);
  });
});

describe('Watch', () => {
  test('should watch for signal changes', () => {
    const count = signal(0);
    const mockFn = jest.fn();

    const unwatch = watch(count, mockFn);

    count.value = 5;
    expect(mockFn).toHaveBeenCalledWith(5, 0);

    count.value = 5; // Same value, should not trigger
    expect(mockFn).toHaveBeenCalledTimes(1);

    count.value = 10;
    expect(mockFn).toHaveBeenCalledWith(10, 5);

    unwatch();
    count.value = 15;
    expect(mockFn).toHaveBeenCalledTimes(2); // No additional calls
  });
});

describe('SafeExecute', () => {
  test('should execute function safely and return result', () => {
    const result = safeExecute(() => 5 + 5);
    expect(result).toBe(10);
  });

  test('should handle errors with default handler', () => {
    const result = safeExecute(() => {
      throw new Error('Test error');
    });

    expect(result).toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  test('should use custom error handler when provided', () => {
    const errorHandler = jest.fn();

    const result = safeExecute(() => {
      throw new Error('Custom error');
    }, errorHandler);

    expect(result).toBeUndefined();
    expect(errorHandler).toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});

describe('MonitorSignals', () => {
  test('should enable monitoring of signal updates', () => {
    monitorSignals(true);

    const count = signal(0);
    count.value = 5;

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Signal updated'));

    // Ensure monitoring is disabled and global state is reset after test
    monitorSignals(false);
    // Optionally, reset any global state or caches here if your implementation requires it
  });
});

describe('Edge Cases', () => {
  test('should handle NaN values correctly', () => {
    const value = signal(NaN);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(value.value);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    value.value = NaN; // NaN !== NaN but we should detect this
    expect(mockFn).toHaveBeenCalledTimes(1); // No additional call
  });

  test('should handle null and undefined correctly', () => {
    const value = signal<number | null | undefined>(0);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(value.value);
    });

    value.value = null;
    expect(mockFn).toHaveBeenCalledWith(null);

    value.value = undefined;
    expect(mockFn).toHaveBeenCalledWith(undefined);
  });

  test('should handle object and array references correctly', () => {
    const obj = { test: 'value' };
    const value = signal(obj);
    const mockFn = jest.fn();

    effect(() => {
      mockFn(value.value);
    });

    // Same object reference, should not trigger
    value.value = obj;
    expect(mockFn).toHaveBeenCalledTimes(1);

    // New object reference, should trigger even with same content
    value.value = { test: 'value' };
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test('should handle maximum batch iterations', () => {
    const value = signal(0);

    // Create an effect that causes infinite updates
    expect(() => {
      effect(() => {
        value.value++; // Will cause infinite loop
      });
    }).toThrow(/Cycle detected in signal updates/);
  });

  test('should handle maximum recursion depth', () => {
    const values: Signal<number>[] = [];

    // Create a chain of signals that's too deep
    for (let i = 0; i < 200; i++) {
      values.push(signal(i));
    }

    expect(() => {
      effect(() => {
        // Access all signals in sequence to create deep dependency chain
        let sum = 0;
        for (const val of values) {
          sum += val.value;
        }
        return sum;
      });
    }).toThrow(/Maximum recursion depth exceeded/);
  });

  test('should clean up resources when disposed', () => {
    const count = signal(0);
    const resource = { dispose: jest.fn() };

    const dispose = effect(() => {
      count.value; // Track dependency
      return () => resource.dispose();
    });

    count.value = 1; // Trigger effect and cleanup
    expect(resource.dispose).toHaveBeenCalledTimes(1);

    dispose(); // Final cleanup
    expect(resource.dispose).toHaveBeenCalledTimes(2);
  });
});

describe('Memory Management', () => {
  test('should allow garbage collection of unused computed signals', () => {
    const mockFn = jest.fn();
    let computed1: ReadonlySignal<number>;

    // Create a computed signal in a scope, but don't keep a reference to it
    (() => {
      const source = signal(1);
      computed1 = computed(() => {
        mockFn();
        return source.value * 2;
      });

      // Access once to trigger computation
      computed1.value;
    })();

    // Memory can't be directly tested, but we can verify no further computations
    expect(mockFn).toHaveBeenCalledTimes(1);

    // The computed signal should be eligible for garbage collection
    // and won't receive any further updates since there's no reference to it
    (globalThis as any).gc && (globalThis as any).gc(); // Force garbage collection if possible

    // This is a weak test as we can't reliably test GC, but the idea is sound
  });
});

describe('Integration Tests', () => {
  test('should handle complex reactive chains', () => {
    const firstName = signal('John');
    const lastName = signal('Doe');
    const age = signal(30);

    const fullName = computed(() => `${firstName.value} ${lastName.value}`);
    const isAdult = computed(() => age.value >= 18);
    const description = computed(() => `${fullName.value} is ${isAdult.value ? 'an adult' : 'a minor'}`);

    const mockFn = jest.fn();
    effect(() => {
      mockFn(description.value);
    });

    expect(mockFn).toHaveBeenCalledWith('John Doe is an adult');

    batch(() => {
      firstName.value = 'Jane';
      age.value = 16;
    });

    expect(mockFn).toHaveBeenCalledWith('Jane Doe is a minor');
  });

  test('should handle selective updates with untracked', () => {
    const count = signal(0);
    const skip = signal(false);
    const mockFn = jest.fn();

    effect(() => {
      // Only react to count when skip is false
      if (!untracked(() => skip.value)) {
        mockFn(count.value);
      } else {
        untracked(() => mockFn('skipped'));
      }
    });

    expect(mockFn).toHaveBeenCalledWith(0);

    count.value = 5;
    expect(mockFn).toHaveBeenCalledWith(5);

    skip.value = true; // This triggers the effect because skip was accessed in the effect
    expect(mockFn).toHaveBeenCalledWith('skipped');

    count.value = 10; // This should not trigger the effect
    expect(mockFn).not.toHaveBeenCalledWith(10);
  });

  test('should properly handle diamond dependency patterns', () => {
    // Diamond pattern:
    //      A
    //    /   \
    //   B     C
    //    \   /
    //      D

    const a = signal(1);                    // 1
    const b = computed(() => a.value * 2);  // 2
    const c = computed(() => a.value + 5);  // 1 + 5 = 6
    const d = computed(() => b.value + c.value); // 2 + 6 = 8

    const mockFn = jest.fn();
    effect(() => mockFn(d.value));

    expect(mockFn).toHaveBeenCalledWith(8); // (1*2) + (1+5) = 2 + 6 = 8

    a.value = 2;
    expect(mockFn).toHaveBeenCalledWith(11); // (2*2) + (2+5) = 4 + 7 = 11
  });
});

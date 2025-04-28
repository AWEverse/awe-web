import UnrolledTaskQueue, { TaskFunction } from './UnrolledTaskQueue';

describe('UnrolledTaskQueue', () => {
  let queue: UnrolledTaskQueue<TaskFunction>;

  beforeEach(() => {
    queue = new UnrolledTaskQueue<TaskFunction>(128, 50);
  });

  // Functional Tests
  test('should initialize with correct defaults', () => {
    expect(queue.length).toBe(0);
    expect(queue.has(() => { })).toBe(false);
  });

  test('should add and track tasks', () => {
    const task = () => { };
    queue.add(task);
    expect(queue.length).toBe(1);
    expect(queue.has(task)).toBe(true);
  });

  test('should not add duplicate tasks', () => {
    const task = () => { };
    queue.add(task);
    queue.add(task);
    expect(queue.length).toBe(1);
  });

  test('should delete tasks', () => {
    const task = () => { };
    queue.add(task);
    queue.delete(task);
    expect(queue.length).toBe(0);
    expect(queue.has(task)).toBe(false);
  });

  test('should clear queue', () => {
    const task = () => { };
    queue.add(task);
    queue.clear();
    expect(queue.length).toBe(0);
    expect(queue.has(task)).toBe(false);
  });

  test('should drain tasks in batches', async () => {
    const tasks: TaskFunction[] = [() => { }, () => { }, () => { }];
    const callback = jest.fn();
    tasks.forEach(task => queue.add(task));

    await new Promise<void>(resolve => {
      queue.drainEach(task => {
        callback(task);
        if (queue.length === 0) resolve();
      });
    });

    expect(callback).toHaveBeenCalledTimes(tasks.length);
    expect(queue.length).toBe(0);
  });

  // Edge Cases
  test('should handle empty queue drainage', async () => {
    const callback = jest.fn();
    queue.drainEach(callback);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle large number of tasks', () => {
    const taskCount = 10000;
    for (let i = 0; i < taskCount; i++) {
      queue.add(() => { });
    }
    expect(queue.length).toBe(taskCount);
  });

  test('should handle node size adjustment', () => {
    const taskCount = 1000;
    for (let i = 0; i < taskCount; i++) {
      queue.add(() => { });
    }
    expect(queue.length).toBe(taskCount);
    queue.clear();
    expect(queue.length).toBe(0);
  });

  // Vulnerability Tests
  test('should prevent concurrent draining', async () => {
    const task = () => { };
    queue.add(task);
    const callback = jest.fn();

    queue.drainEach(callback);
    queue.drainEach(callback); // Should be ignored

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should handle null/undefined tasks', () => {
    expect(() => queue.add(null as any)).not.toThrow();
    expect(() => queue.add(undefined as any)).not.toThrow();
    expect(queue.length).toBe(2);
  });

  describe('Performance', () => {
    test('add performance', () => {
      const start = performance.now();
      const taskCount = 10000;
      for (let i = 0; i < taskCount; i++) {
        queue.add(() => { });
      }
      const duration = performance.now() - start;
      console.log(`Adding ${taskCount} tasks took ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(1000);
    });

    test('drain performance', async () => {
      const taskCount = 10000;
      for (let i = 0; i < taskCount; i++) {
        queue.add(() => { });
      }

      const start = performance.now();
      await new Promise<void>(resolve => {
        queue.drainEach(() => {
          if (queue.length === 0) {
            const duration = performance.now() - start;
            console.log(`Draining ${taskCount} tasks took ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(1000);
            resolve();
          }
        });
      });
    });
  });
});

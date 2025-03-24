import throttleWithRafFallback from "../throttleWithRafFallback";

type Phase = "idle" | "measure" | "mutate" | "composite";
enum TaskPriority { LOW = 0, NORMAL = 1, HIGH = 2, CRITICAL = 3 }

interface TaskInfo { id: number; name?: string; phase: Phase; priority: TaskPriority; timestamp: number; executionTime?: number; error?: Error }
interface Task { fn: () => void; info: TaskInfo }
type TaskQueue = Task[][];

interface SchedulerConfig {
  frameTimeBudget: number;
  maxTasksPerFrame: number;
  enableProfiling: boolean;
  enableErrorHandling: boolean;
  adaptiveThrottling: boolean;
  maxQueueSize: number;
}

const defaultConfig: SchedulerConfig = {
  frameTimeBudget: 12,
  maxTasksPerFrame: 100,
  enableProfiling: false,
  enableErrorHandling: true,
  adaptiveThrottling: true,
  maxQueueSize: 10000,
};

const scheduler = (() => {
  let taskIdCounter = 0;
  const taskQueues: Partial<Record<Phase, TaskQueue>> = {};
  const taskLookup = new Map<number, { task: Task; queueRef: Task[] }>();
  let config = { ...defaultConfig };
  let errorHandler = (e: Error, info: TaskInfo) => console.error(`Task ${info.id} failed:`, e);

  const stats = { tasksScheduled: 0, tasksExecuted: 0, tasksDropped: 0, errors: 0, avgExecutionTime: 0 };

  function getQueue(phase: Phase): TaskQueue {
    return (taskQueues[phase] ??= [[], [], [], []]);
  }

  const executeTask = (task: Task): boolean => {
    const start = config.enableProfiling ? performance.now() : 0;
    try {
      task.fn();
      stats.tasksExecuted++; // Always increment, regardless of profiling
      if (config.enableProfiling) {
        const time = performance.now() - start;
        task.info.executionTime = time;
        stats.avgExecutionTime = (stats.avgExecutionTime * (stats.tasksExecuted - 1) + time) / stats.tasksExecuted;
      }
      return true;
    } catch (error) {
      stats.errors++;
      task.info.error = error as Error;
      if (config.enableErrorHandling) errorHandler(error as Error, task.info);
      return false;
    }
  };

  function processTasks(phase: Phase, priority: TaskPriority): number {
    const queue = getQueue(phase)[priority];
    if (queue.length === 0) return 0;

    let processed = 0;
    const startTime = config.adaptiveThrottling ? performance.now() : 0;
    const batchSize = Math.min(config.maxTasksPerFrame, queue.length);

    const tasksToProcess = queue.slice(0, batchSize);
    queue.splice(0, batchSize);

    for (const task of tasksToProcess) {
      taskLookup.delete(task.info.id);
      if (executeTask(task)) processed++;
      if (config.adaptiveThrottling && performance.now() - startTime > config.frameTimeBudget) break;
    }
    return processed;
  }

  const runUpdatePass = throttleWithRafFallback(async () => {
    try {
      const priorities = [TaskPriority.CRITICAL, TaskPriority.HIGH, TaskPriority.NORMAL, TaskPriority.LOW];
      let hasMeasureTasks = false;

      for (const priority of priorities) {
        if (processTasks("measure", priority) > 0) hasMeasureTasks = true;
      }
      if (hasMeasureTasks) await Promise.resolve();

      for (const priority of priorities) {
        processTasks("mutate", priority);
        processTasks("composite", priority);
        processTasks("idle", priority);
      }
    } catch (error) {
      stats.errors++;
      console.error("runUpdatePass failed:", error);
    }
  });

  function scheduleTask(phase: Phase, fn: () => void, priority: TaskPriority = TaskPriority.NORMAL, name?: string): () => boolean {
    const totalTasks = stats.tasksScheduled - stats.tasksExecuted - stats.tasksDropped;
    if (totalTasks >= config.maxQueueSize) {
      stats.tasksDropped++;
      return () => false;
    }

    const taskId = taskIdCounter++;
    const task: Task = { fn, info: { id: taskId, name, phase, priority, timestamp: performance.now() } };
    const queue = getQueue(phase)[priority];
    queue.push(task);
    taskLookup.set(taskId, { task, queueRef: queue });
    stats.tasksScheduled++;
    runUpdatePass(); // Ensure this triggers

    return () => {
      const entry = taskLookup.get(taskId);
      if (!entry) return false;
      const { queueRef, task } = entry;
      const index = queueRef.indexOf(task);
      if (index !== -1) {
        queueRef.splice(index, 1);
        taskLookup.delete(taskId);
        stats.tasksDropped++;
        return true;
      }
      return false;
    };
  }

  return {
    scheduleTask,
    configure: (options: Partial<SchedulerConfig>) => (config = { ...defaultConfig, ...options }),
    setTaskErrorHandler: (handler: (error: Error, info: TaskInfo) => void) => (errorHandler = handler),
    getStats: () => ({ ...stats }),
    forceRun: () => runUpdatePass(), // For debugging
  };
})();

export const requestMeasure = (fn: () => void, priority = TaskPriority.NORMAL, name?: string) => scheduler.scheduleTask("measure", fn, priority, name);
export const requestMutation = (fn: () => void, priority = TaskPriority.NORMAL, name?: string) => scheduler.scheduleTask("mutate", fn, priority, name);
export const requestComposite = (fn: () => void, priority = TaskPriority.NORMAL, name?: string) => scheduler.scheduleTask("composite", fn, priority, name);
export const requestIdle = (fn: () => void, priority = TaskPriority.NORMAL, name?: string) => scheduler.scheduleTask("idle", fn, priority, name);
export const configure = scheduler.configure;
export const setTaskErrorHandler = scheduler.setTaskErrorHandler;
export const getStats = scheduler.getStats;

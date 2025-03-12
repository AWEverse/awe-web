import safeExecDOM from "../safeExecDOM";
import { setPhase } from "../stricterdom";
import throttleWithRafFallback from "../throttleWithRafFallback";

/**
 * Defines the priority levels for task execution
 * Higher numbers indicate higher priority
 */
enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * Task execution phases
 */
type Phase = "idle" | "measure" | "mutate" | "composite";

/**
 * Base task function type
 */
type TaskFunction = () => void;

/**
 * Task function that returns another task function or void
 */
type ReflowTaskFunction = () => TaskFunction | void;

/**
 * Handler for task execution errors
 */
type ErrorHandler = (error: Error, taskInfo: TaskInfo) => void;

/**
 * Task information for debugging and profiling
 */
interface TaskInfo {
  id: number;
  name?: string;
  phase: Phase;
  priority: TaskPriority;
  timestamp: number;
  executionTime?: number;
  error?: Error;
}

/**
 * Task object with metadata
 */
interface Task {
  fn: TaskFunction | ReflowTaskFunction;
  info: TaskInfo;
}

// Generate unique task IDs using a closure for better encapsulation
const getNextTaskId = (() => {
  let nextTaskId = 0;
  return () => nextTaskId++;
})();

// Default error handler logs to console
let handleError: ErrorHandler = (error, taskInfo) => {
  console.error(`DOM task error in ${taskInfo.phase} phase:`, error, taskInfo);
};

const createTaskQueues = (): Record<Phase, Map<TaskPriority, Set<Task>>> => {
  const phases: Phase[] = ["idle", "measure", "mutate", "composite"];
  const priorities: TaskPriority[] = [
    TaskPriority.LOW,
    TaskPriority.NORMAL,
    TaskPriority.HIGH,
    TaskPriority.CRITICAL,
  ];

  return Object.fromEntries(
    phases.map(phase => [
      phase,
      new Map(
        priorities.map(priority => [priority, new Set<Task>()])
      )
    ])
  ) as Record<Phase, Map<TaskPriority, Set<Task>>>;
};

const taskQueues = createTaskQueues();


// Statistics for performance monitoring
const stats = {
  tasksScheduled: 0,
  tasksExecuted: 0,
  tasksDropped: 0,
  errors: 0,
  avgExecutionTime: 0,
  maxExecutionTime: 0,
  lastFrameTime: 0,
  frameDrops: 0,
  // Add timestamps for better debugging
  lastExecutionTime: 0,
  // Add phase-specific stats
  phaseStats: {
    measure: { executed: 0, errors: 0, time: 0 },
    mutate: { executed: 0, errors: 0, time: 0 },
    composite: { executed: 0, errors: 0, time: 0 },
    idle: { executed: 0, errors: 0, time: 0 }
  }
};

// Configuration options
const config = {
  frameTimeBudget: 12, // ms, target is 60fps with some overhead
  enableProfiling: false,
  maxTasksPerFrame: 100, // Safety limit
  enableAutoGrouping: true, // Automatically group related DOM operations
  useMicrotaskForReflow: true, // Use microtasks between measure and mutate
  adaptiveThrottling: true, // Adjust throttling based on device performance
  // Add safety timeout to prevent infinite loops
  maxTaskExecutionTime: 50, // ms
  // Add a flag to abort all tasks in case of emergency
  abortAllTasks: false
};

/**
 * Safely executes a task with timeout protection
 * @param task The task to execute
 * @param phase Current execution phase
 * @returns Whether the task executed successfully
 */
const executeTaskSafely = (task: Task, phase: Phase): boolean => {
  if (config.abortAllTasks) return false;

  const taskStartTime = config.enableProfiling ? performance.now() : 0;
  let success = false;

  try {

    // setPhase(phase); // Ensure correct phase is set before execution

    // Execute with safety wrapper
    safeExecDOM(() => {
      // Set timeout protection for long-running tasks
      const timeoutId = config.maxTaskExecutionTime > 0
        ? setTimeout(() => {
          throw new Error(`Task execution timeout (${config.maxTaskExecutionTime}ms): ${task.info.name || 'unnamed task'}`);
        }, config.maxTaskExecutionTime)
        : null;

      try {
        task.fn();
        success = true;
      } finally {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      }
    });

    stats.tasksExecuted++;
    stats.phaseStats[phase].executed++;

    if (config.enableProfiling && taskStartTime > 0) {
      const executionTime = performance.now() - taskStartTime;
      task.info.executionTime = executionTime;
      stats.avgExecutionTime = (stats.avgExecutionTime * (stats.tasksExecuted - 1) + executionTime) / stats.tasksExecuted;
      stats.maxExecutionTime = Math.max(stats.maxExecutionTime, executionTime);
      stats.lastExecutionTime = performance.now();
      stats.phaseStats[phase].time += executionTime;
    }
  } catch (error) {
    stats.errors++;
    stats.phaseStats[phase].errors++;
    task.info.error = error as Error;
    handleError(error as Error, task.info);
  }

  return success;
};

/**
 * Processes tasks from a specific phase and priority queue
 * @param phase The execution phase
 * @param priority The priority level to process
 * @returns Number of tasks processed
 */
const processTasks = (phase: Phase, priority: TaskPriority): number => {
  const queue = taskQueues[phase].get(priority);
  if (!queue || queue.size === 0) return 0;

  // Create a snapshot of the current queue to prevent infinite loops
  // if tasks add more tasks to the same queue
  const tasks = Array.from(queue);
  queue.clear();

  let processed = 0;
  const startTime = performance.now();
  const maxTasks = Math.min(tasks.length, config.maxTasksPerFrame);

  for (let i = 0; i < maxTasks; i++) {
    if (config.abortAllTasks) break;

    const task = tasks[i];

    if (executeTaskSafely(task, phase)) {
      processed++;
    }

    // Check if we're exceeding our frame budget
    if (config.adaptiveThrottling && performance.now() - startTime > config.frameTimeBudget) {
      // Move remaining tasks to next frame
      for (let j = i + 1; j < tasks.length; j++) {
        queue.add(tasks[j]);
      }
      stats.frameDrops++;
      break;
    }
  }

  return processed;
};

/**
 * Process reflow tasks (measure then mutate)
 * @returns Number of tasks processed
 */
const processReflowTasks = async (): Promise<number> => {
  const reflowQueue = taskQueues.idle.get(TaskPriority.NORMAL);
  if (!reflowQueue || reflowQueue.size === 0 || config.abortAllTasks) return 0;

  // Create a snapshot of the current queue
  const tasks = Array.from(reflowQueue);
  reflowQueue.clear();

  // First measure phase
  setPhase("measure");
  const followUpTasks: Task[] = [];

  for (const task of tasks) {
    if (config.abortAllTasks) break;

    try {
      const result = safeExecDOM(() => (task.fn as ReflowTaskFunction)());
      if (typeof result === 'function') {
        // Create a follow-up mutation task
        followUpTasks.push({
          fn: result,
          info: {
            id: getNextTaskId(),
            phase: "mutate",
            priority: task.info.priority,
            timestamp: performance.now(),
            name: task.info.name ? `${task.info.name}_mutation` : undefined
          }
        });
      }
      stats.tasksExecuted++;
      stats.phaseStats.measure.executed++;
    } catch (error) {
      stats.errors++;
      stats.phaseStats.measure.errors++;
      task.info.error = error as Error;
      handleError(error as Error, task.info);
    }
  }

  // Wait for any microtasks if configured
  if (config.useMicrotaskForReflow && followUpTasks.length > 0) {
    await Promise.resolve();
  }

  // Then mutation phase for follow-up tasks
  if (followUpTasks.length > 0 && !config.abortAllTasks) {
    setPhase("mutate");
    for (const task of followUpTasks) {
      executeTaskSafely(task, "mutate");
    }
  }

  return tasks.length;
};

/**
 * Main frame update function - processes all task queues in the correct order
 */
const runUpdatePass = throttleWithRafFallback(async () => {
  try {
    const frameStartTime = performance.now();
    stats.lastFrameTime = frameStartTime;

    // Reset abort flag before each frame
    config.abortAllTasks = false;

    // Process critical tasks first, regardless of their intended phase
    for (const phase of ["measure", "mutate", "composite", "idle"] as Phase[]) {
      processTasks(phase, TaskPriority.CRITICAL);

      // Allow for emergency abort
      if (config.abortAllTasks) return;
    }

    // 1. Process measure phase tasks (DOM reads)
    for (const priority of [TaskPriority.HIGH, TaskPriority.NORMAL, TaskPriority.LOW]) {
      processTasks("measure", priority);
      if (config.abortAllTasks) return;
    }

    // Allow microtasks to execute between phases
    if (config.useMicrotaskForReflow) {
      await Promise.resolve();
    }

    // 2. Process mutation phase tasks (DOM writes)
    for (const priority of [TaskPriority.HIGH, TaskPriority.NORMAL, TaskPriority.LOW]) {
      processTasks("mutate", priority);
      if (config.abortAllTasks) return;
    }

    // 3. Process composite phase tasks (animations/visual updates)
    for (const priority of [TaskPriority.HIGH, TaskPriority.NORMAL, TaskPriority.LOW]) {
      processTasks("composite", priority);
      if (config.abortAllTasks) return;
    }

    // 4. Process reflow tasks (measure → mutate sequence)
    await processReflowTasks();
    if (config.abortAllTasks) return;

    // 5. Process idle tasks if time permits
    if (config.adaptiveThrottling &&
      performance.now() - frameStartTime < config.frameTimeBudget &&
      !config.abortAllTasks) {
      for (const priority of [TaskPriority.HIGH, TaskPriority.NORMAL, TaskPriority.LOW]) {
        processTasks("idle", priority);
        if (config.abortAllTasks) return;
      }
    }
  } catch (error) {
    console.error("Fatal error in update pass:", error);
    // Set abort flag to prevent further task execution
    config.abortAllTasks = true;
  } finally {
    // Always reset to measure phase when done to ensure safety
    setPhase("measure");
  }
});

/**
 * Emergency function to abort all pending tasks
 */
export function abortAllTasks(): void {
  config.abortAllTasks = true;
  clearAllTasks();
}

/**
 * Adds a task to the appropriate queue
 * @param phase The execution phase
 * @param fn The task function to execute
 * @param priority The task priority
 * @param name Optional name for debugging
 * @returns Function to cancel the scheduled task
 */
function scheduleTask(
  phase: Phase,
  fn: TaskFunction | ReflowTaskFunction,
  priority: TaskPriority = TaskPriority.NORMAL,
  name?: string
): () => boolean {
  if (typeof fn !== 'function') {
    console.error("Attempted to schedule non-function task", fn);
    return () => false;
  }

  const taskId = getNextTaskId();
  const task: Task = {
    fn,
    info: {
      id: taskId,
      name,
      phase,
      priority,
      timestamp: performance.now()
    }
  };

  const queue = taskQueues[phase].get(priority);
  if (!queue) return () => false;

  queue.add(task);
  stats.tasksScheduled++;

  // Start the update cycle
  runUpdatePass();

  // Return a function to cancel this task if needed
  return () => {
    const isRemoved = queue.delete(task);
    if (isRemoved) {
      stats.tasksDropped++;
    }
    return isRemoved;
  };
}

/**
 * Automatically groups related DOM operations to reduce layout thrashing
 * @param operations List of operations to group
 */
function batchOperations(operations: Array<{ fn: TaskFunction, phase: Phase, priority?: TaskPriority }>) {
  if (!Array.isArray(operations) || operations.length === 0) {
    return;
  }

  // Group operations by phase
  const measureOps: TaskFunction[] = [];
  const mutateOps: TaskFunction[] = [];
  const compositeOps: TaskFunction[] = [];
  const idleOps: TaskFunction[] = [];

  // Validate and sort operations
  operations.forEach(op => {
    if (typeof op.fn !== 'function') {
      console.error("Invalid operation in batchOperations:", op);
      return;
    }

    switch (op.phase) {
      case "measure":
        measureOps.push(op.fn);
        break;
      case "mutate":
        mutateOps.push(op.fn);
        break;
      case "composite":
        compositeOps.push(op.fn);
        break;
      case "idle":
        idleOps.push(op.fn);
        break;
      default:
        console.warn(`Unknown phase "${op.phase}" in batchOperations`);
    }
  });

  // Schedule all operations in the correct order
  // Schedule all measure operations first
  if (measureOps.length > 0) {
    requestMeasure(() => {
      measureOps.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error("Error in batched measure operation:", error);
        }
      });
    }, TaskPriority.NORMAL, "batch_measure");
  }

  // Then schedule all mutation operations
  if (mutateOps.length > 0) {
    requestMutation(() => {
      mutateOps.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error("Error in batched mutate operation:", error);
        }
      });
    }, TaskPriority.NORMAL, "batch_mutate");
  }

  // Then composite operations
  if (compositeOps.length > 0) {
    requestComposite(() => {
      compositeOps.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error("Error in batched composite operation:", error);
        }
      });
    }, TaskPriority.NORMAL, "batch_composite");
  }

  // Finally idle operations
  if (idleOps.length > 0) {
    requestIdle(() => {
      idleOps.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error("Error in batched idle operation:", error);
        }
      });
    }, TaskPriority.NORMAL, "batch_idle");
  }
}

/**
 * Schedules a DOM read operation in the measure phase
 * @param fn Function performing DOM reads
 * @param priority Priority level for this operation
 * @param name Optional name for debugging
 * @returns Function to cancel the scheduled task
 */
export function requestMeasure(
  fn: TaskFunction,
  priority: TaskPriority = TaskPriority.NORMAL,
  name?: string
): () => boolean {
  if (typeof fn !== 'function') {
    console.error("Invalid function passed to requestMeasure");
    return () => false;
  }
  return scheduleTask("measure", fn, priority, name);
}

/**
 * Schedules a DOM write operation in the mutate phase
 * @param fn Function performing DOM writes
 * @param priority Priority level for this operation
 * @param name Optional name for debugging
 * @returns Function to cancel the scheduled task
 */
export function requestMutation(
  fn: TaskFunction,
  priority: TaskPriority = TaskPriority.NORMAL,
  name?: string
): () => boolean {
  if (typeof fn !== 'function') {
    console.error("Invalid function passed to requestMutation");
    return () => false;
  }
  return scheduleTask("mutate", fn, priority, name);
}

/**
 * Schedules a two-phase operation: first measure, then mutate
 * @param fn Function that reads from DOM and returns a function to write to DOM
 * @param priority Priority level for this operation
 * @param name Optional name for debugging
 * @returns Function to cancel the scheduled task
 */
export function requestNextMutation(
  fn: ReflowTaskFunction,
  priority: TaskPriority = TaskPriority.NORMAL,
  name?: string
): () => boolean {
  if (typeof fn !== 'function') {
    console.error("Invalid function passed to requestNextMutation");
    return () => false;
  }
  return scheduleTask("idle", fn, priority, name);
}

/**
 * Schedules a task to run during the composite phase (visual updates)
 * @param fn Function performing visual updates
 * @param priority Priority level for this operation
 * @param name Optional name for debugging
 * @returns Function to cancel the scheduled task
 */
export function requestComposite(
  fn: TaskFunction,
  priority: TaskPriority = TaskPriority.NORMAL,
  name?: string
): () => boolean {
  if (typeof fn !== 'function') {
    console.error("Invalid function passed to requestComposite");
    return () => false;
  }
  return scheduleTask("composite", fn, priority, name);
}

/**
 * Schedules a task to run during idle time
 * @param fn Function to execute during idle time
 * @param priority Priority level for this operation
 * @param name Optional name for debugging
 * @returns Function to cancel the scheduled task
 */
export function requestIdle(
  fn: TaskFunction,
  priority: TaskPriority = TaskPriority.LOW,
  name?: string
): () => boolean {
  if (typeof fn !== 'function') {
    console.error("Invalid function passed to requestIdle");
    return () => false;
  }
  return scheduleTask("idle", fn, priority, name);
}

/**
 * Sets a custom error handler for task execution errors
 * @param handler Function to handle errors
 */
export function setTaskErrorHandler(handler: ErrorHandler): void {
  if (typeof handler !== 'function') {
    console.error("Invalid error handler provided");
    return;
  }
  handleError = handler;
}

/**
 * Updates configuration options
 * @param options Configuration options to update
 */
export function configure(options: Partial<typeof config>): void {
  if (!options || typeof options !== 'object') {
    console.error("Invalid configuration options");
    return;
  }

  // Validate specific configuration properties
  if (options.frameTimeBudget !== undefined &&
    (typeof options.frameTimeBudget !== 'number' || options.frameTimeBudget <= 0)) {
    console.warn("Invalid frameTimeBudget, must be a positive number");
    delete options.frameTimeBudget;
  }

  if (options.maxTasksPerFrame !== undefined &&
    (typeof options.maxTasksPerFrame !== 'number' || options.maxTasksPerFrame <= 0)) {
    console.warn("Invalid maxTasksPerFrame, must be a positive number");
    delete options.maxTasksPerFrame;
  }

  Object.assign(config, options);
}

/**
 * Returns performance statistics
 * @returns Copy of current statistics
 */
export function getStats(): typeof stats {
  return { ...stats };
}

/**
 * Resets performance statistics
 */
export function resetStats(): void {
  Object.assign(stats, {
    tasksScheduled: 0,
    tasksExecuted: 0,
    tasksDropped: 0,
    errors: 0,
    avgExecutionTime: 0,
    maxExecutionTime: 0,
    lastFrameTime: 0,
    frameDrops: 0,
    lastExecutionTime: 0,
    phaseStats: {
      measure: { executed: 0, errors: 0, time: 0 },
      mutate: { executed: 0, errors: 0, time: 0 },
      composite: { executed: 0, errors: 0, time: 0 },
      idle: { executed: 0, errors: 0, time: 0 }
    }
  });
}

/**
 * Clears all pending tasks from all queues
 */
export function clearAllTasks(): void {
  for (const phase of Object.keys(taskQueues) as Phase[]) {
    for (const priorityMap of Object.values(taskQueues[phase])) {
      if (priorityMap instanceof Map) {
        for (const [priority, queue] of priorityMap.entries()) {
          if (queue && queue.size > 0) {
            stats.tasksDropped += queue.size;
            queue.clear();
          }
        }
      }
    }
  }
}

/**
 * Detects if the current device is likely to be slow based on hardware capabilities.
 * @returns {boolean} Whether the device is considered slow.
 */
export const detectSlowDevice = (): boolean => {
  // Ensure we're in a browser environment
  if (typeof navigator === 'undefined') {
    console.warn("detectSlowDevice: Navigator unavailable, assuming non-slow device.");
    return false;
  }

  try {
    // Check hardware concurrency (number of logical CPU cores)
    if (navigator.hardwareConcurrency !== undefined) {
      // Consider devices with 2 or fewer cores as potentially slow
      // Adjust this threshold based on your app's needs (e.g., <= 4 for more conservative checks)
      if (navigator.hardwareConcurrency <= 2) {
        return true;
      }
    }

    // Check device memory (available in Chrome/Edge, returns approximate GB)
    interface NavigatorWithMemory extends Navigator {
      deviceMemory?: number;
    }
    const nav = navigator as NavigatorWithMemory;
    if (nav.deviceMemory !== undefined) {
      // Consider devices with less than 2GB of RAM as slow
      // Adjust this threshold (e.g., < 3 or < 4) based on your app's memory demands
      if (nav.deviceMemory < 2) {
        return true;
      }
    }

    // If no conclusive data is available, assume the device is not slow
    return false;
  } catch (error) {
    console.warn("detectSlowDevice: Error detecting device capabilities:", error);
    return false; // Default to false on error to avoid over-optimizing for unknown devices
  }
};

// Initialize with appropriate settings for the device
if (detectSlowDevice()) {
  configure({
    frameTimeBudget: 8, // More conservative budget for slower devices
    maxTasksPerFrame: 50,
    adaptiveThrottling: true
  });
}

// Export all utilities
export {
  TaskPriority,
  batchOperations
};

// export * from "./stricterdom";

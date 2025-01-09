/**
 * Interface for controlling an object's start/stop life cycle.
 * In the React paradigm, this is a useful way of introducing a lifecycle into a component or related things.
 */
export interface ILifeCycle {
  /**
   * Checks whether the object has been started.
   *
   * @returns true if started, false otherwise.
   * @see start, stop
   */
  isStarted(): boolean;

  /**
   * Starts the object.
   *
   * @returns true if it was started, false otherwise.
   * @see isStarted, stop
   */
  start(): boolean;

  /**
   * Stops the object.
   *
   * @returns true if it was stopped, false otherwise.
   * @see isStarted, start
   */
  stop(): boolean;
}

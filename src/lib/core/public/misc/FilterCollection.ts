import { CallbackManager, createCallbackManager } from '@/lib/utils/callbacks';

export interface IFilterCollection<T> {
  passesFilter(item: T): boolean;
  onChanged: () => void | (() => void);
}

export default class AdvancedFilterCollection<T> {
  private childFilters: Map<number, IFilterCollection<T>> = new Map();
  private changedEventCallbacks: CallbackManager = createCallbackManager();
  private filterIdCounter: number = 0; // Unique ID for each filter for easy tracking

  /**
   * Adds a filter to the collection and sets up the onChanged callback for that filter.
   * Returns the unique ID of the filter.
   */
  public add(filter: IFilterCollection<T>): number {
    const filterId = this.filterIdCounter++;
    this.childFilters.set(filterId, filter);

    filter.onChanged = () => this.onChildFilterChanged();

    this.broadcastChangedEvent();
    return filterId;
  }

  /**
   * Removes a filter by its ID.
   * Returns true if the filter was successfully removed, false if the filter was not found.
   */
  public removeById(filterId: number): boolean {
    const filter = this.childFilters.get(filterId);
    if (!filter) {
      return false;
    }

    filter.onChanged = () => {};
    this.childFilters.delete(filterId);

    this.broadcastChangedEvent();
    return true;
  }

  /**
   * Removes a filter by reference.
   * Returns true if the filter was successfully removed, false otherwise.
   */
  public remove(filter: IFilterCollection<T>): boolean {
    let found = false;

    this.childFilters.forEach((f, id) => {
      if (f === filter) {
        this.removeById(id);
        found = true;
      }
    });

    return found;
  }

  /**
   * Gets the filter by its index in the Map (not the ID).
   * Returns the filter if found, or undefined if not found.
   */
  public getFilterAtIndex(index: number): IFilterCollection<T> | undefined {
    return Array.from(this.childFilters.values())[index];
  }

  /**
   * Returns the number of filters in the collection.
   */
  public num(): number {
    return this.childFilters.size;
  }

  /**
   * Checks if the item passes all filters in the collection.
   */
  public passesAllFilters(item: T): boolean {
    for (const filter of this.childFilters.values()) {
      if (!filter.passesFilter(item)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Adds a callback to the collection's change event.
   * Returns a function that allows the caller to unsubscribe the callback.
   */
  public onChanged(callback: () => void): () => void {
    const unsubscribe = this.changedEventCallbacks.addCallback(callback);
    return unsubscribe;
  }

  /**
   * Clears all filters and broadcasts a change event.
   */
  public clear(): void {
    this.childFilters.forEach(filter => (filter.onChanged = () => {}));
    this.childFilters.clear();
    this.broadcastChangedEvent();
  }

  /**
   * Broadcasts the change event to all registered callbacks.
   */
  private broadcastChangedEvent(): void {
    this.changedEventCallbacks.runCallbacks();
  }

  /**
   * Called when any child filter changes.
   */
  private onChildFilterChanged(): void {
    this.broadcastChangedEvent();
  }
}

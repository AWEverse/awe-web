import { CallbackManager, createCallbackManager } from '../callbacks';

type CollectionChangedCallback<T> = (action: CollectionAction, items: T[], oldIndex?: number, newIndex?: number) => void;

interface IObservableCollection<T> {
  addItem(item: T): void;
  addItems(items: T[]): void;
  removeItem(item: T): void;
  removeItems(items: T[]): void;
  moveItem(item: T, newIndex: number): void;
  refreshCollection(): void;
  onCollectionChanged(callback: CollectionChangedCallback<T>): NoneToVoidFunction;
  onItemPropertyChanged(callback: (changedItems: T[]) => void): NoneToVoidFunction;
}

type CollectionAction = 'add' | 'remove' | 'move' | 'refresh';

/**
 * Represents an advanced observable collection of items.
 * @template T - The type of items in the collection.
 */
class ObservableCollection<T> implements IObservableCollection<T> {
  private items: { item: T; index: number }[] = [];

  private collectionChangedObserver: CallbackManager<CollectionChangedCallback<T>>;
  private itemPropertyChangedObserver: CallbackManager<(changedItems: T[]) => void>;

  constructor() {
    this.collectionChangedObserver = createCallbackManager<CollectionChangedCallback<T>>();
    this.itemPropertyChangedObserver = createCallbackManager<(changedItems: T[]) => void>();
  }

  /**
   * Gets the count of items in the collection.
   * @returns The number of items.
   */
  public getItemCount(): number {
    return this.items.length;
  }

  /**
   * Adds a single item to the collection.
   * @param item - The item to add.
   */
  public addItem(item: T): void {
    if (this.items.find(i => i.item === item)) {
      throw new Error('Item already exists in the collection.');
    }
    this.items.push({ item, index: this.items.length });
    this.triggerCallbacks('add', [item]);
  }

  /**
   * Adds multiple items to the collection.
   * @param items - The items to add.
   */
  public addItems(items: T[]): void {
    const existingItems = new Set(this.items.map(i => i.item));
    const newItems = items.filter(item => !existingItems.has(item));

    if (newItems.length === 0) return;

    const startIndex = this.items.length;

    newItems.forEach((item, index) => {
      this.items.push({ item, index: startIndex + index });
    });

    this.triggerCallbacks('add', newItems);
  }

  /**
   * Removes a single item from the collection.
   * @param item - The item to remove.
   */
  public removeItem(item: T): void {
    const index = this.items.findIndex(i => i.item === item);

    if (index === -1) {
      throw new Error('Item does not exist in the collection.');
    }

    this.items.splice(index, 1);
    this.updateItemIndices();

    this.triggerCallbacks('remove', [item]);
  }

  /**
   * Removes multiple items from the collection.
   * @param items - The items to remove.
   */
  public removeItems(items: T[]): void {
    if (items.length === 0) return;

    // Create a set of items to be removed for O(1) lookups
    const itemsToRemoveSet = new Set(items);

    // Filter out items to remove and keep the remaining items
    const remainingItems = this.items.filter(i => !itemsToRemoveSet.has(i.item));

    if (remainingItems.length === this.items.length) return;

    this.items = remainingItems;
    this.updateItemIndices();

    this.triggerCallbacks('remove', items);
  }

  /**
   * Moves an item to a new position in the collection.
   * @param item - The item to move.
   * @param newIndex - The new index for the item.
   */
  public moveItem(item: T, newIndex: number): void {
    const oldIndex = this.items.findIndex(i => i.item === item);

    if (oldIndex === -1 || newIndex < 0 || newIndex >= this.items.length || oldIndex === newIndex) {
      throw new Error('Invalid operation for moving the item.');
    }

    const [movedItem] = this.items.splice(oldIndex, 1);
    this.items.splice(newIndex, 0, movedItem);

    this.updateItemIndices();
    this.triggerCallbacks('move', [item], oldIndex, newIndex);
  }

  /**
   * Refreshes the entire collection.
   */
  public refreshCollection(): void {
    this.triggerCallbacks(
      'refresh',
      this.items.map(i => i.item),
    );
  }

  /**
   * Registers a callback for collection changes.
   * @param callback - The callback function to register.
   * @returns A function to unregister the callback.
   */
  public onCollectionChanged(callback: CollectionChangedCallback<T>): NoneToVoidFunction {
    return this.collectionChangedObserver.addCallback(callback);
  }

  /**
   * Registers a callback for item property changes.
   * @param callback - The callback function to register.
   * @returns A function to unregister the callback.
   */
  public onItemPropertyChanged(callback: (changedItems: T[]) => void): NoneToVoidFunction {
    return this.itemPropertyChangedObserver.addCallback(callback);
  }

  /**
   * Updates the index mappings of all items in the collection.
   */
  private updateItemIndices(): void {
    this.items.forEach((item, index) => {
      item.index = index;
    });
  }

  /**
   * Triggers callbacks for collection changes and item property changes.
   * @param action - The type of collection action.
   * @param items - The items involved in the action.
   * @param oldIndex - The old index of the item (optional).
   * @param newIndex - The new index of the item (optional).
   */
  private triggerCallbacks(action: CollectionAction, items: T[], oldIndex?: number, newIndex?: number): void {
    if (items.length === 0) return;

    this.collectionChangedObserver.runCallbacks(action, items, oldIndex, newIndex);
    this.itemPropertyChangedObserver.runCallbacks(items);
  }
}

export default ObservableCollection;
export type { CollectionAction, CollectionChangedCallback };

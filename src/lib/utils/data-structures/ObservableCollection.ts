import { createCallbackManager } from '../callbacks';

type CollectionAction = 'add' | 'remove' | 'move' | 'refresh';
type Callback<T> = (action: CollectionAction, items: T[], oldIndex?: number, newIndex?: number) => void;

class ObservableCollection<T> {
  private items: T[] = [];
  private observer = createCallbackManager<Callback<T>>();

  get count() { return this.items.length; }

  addItem(item: T) {
    if (this.items.includes(item)) throw new Error('Item exists');
    this.items.push(item);
    this.notify('add', [item]);
  }

  addItems(items: T[]) {
    const newItems = items.filter(i => !this.items.includes(i));
    if (newItems.length) {
      this.items.push(...newItems);
      this.notify('add', newItems);
    }
  }

  removeItem(item: T) {
    const index = this.items.indexOf(item);
    if (index === -1) throw new Error('Item not found');
    this.items.splice(index, 1);
    this.notify('remove', [item]);
  }

  removeItems(items: T[]) {
    const removed = items.filter(i => {
      const index = this.items.indexOf(i);
      if (index > -1) return this.items.splice(index, 1);
      return false;
    });
    if (removed.length) this.notify('remove', removed);
  }

  moveItem(item: T, newIndex: number) {
    const oldIndex = this.items.indexOf(item);
    if (oldIndex === -1 || newIndex < 0 || newIndex >= this.items.length || oldIndex === newIndex) {
      throw new Error('Invalid move');
    }
    const [moved] = this.items.splice(oldIndex, 1);
    this.items.splice(newIndex, 0, moved);
    this.notify('move', [item], oldIndex, newIndex);
  }

  refresh() {
    this.notify('refresh', [...this.items]);
  }

  onChanged(callback: Callback<T>) {
    return this.observer.addCallback(callback);
  }

  private notify(action: CollectionAction, items: T[], oldIndex?: number, newIndex?: number) {
    if (items.length) this.observer.runCallbacks(action, items, oldIndex, newIndex);
  }
}

export default ObservableCollection;
export type { CollectionAction };

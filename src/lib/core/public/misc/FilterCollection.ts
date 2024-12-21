export interface IFilterCollection<T> {
  passesFilter(item: T): boolean;
  onChanged: () => void;
}

export default class FilterCollection<T> {
  private childFilters: IFilterCollection<T>[] = [];
  private changedEventCallbacks: NoneToVoidFunction[] = [];

  public destroy(): void {
    this.childFilters.forEach(filter => {
      filter.onChanged = () => {};
    });
  }

  public add(filter: IFilterCollection<T>): number {
    const existingIdx = this.childFilters.indexOf(filter);
    if (existingIdx !== -1) {
      return existingIdx;
    }

    this.childFilters.push(filter);
    filter.onChanged = () => this.onChildFilterChanged();

    this.broadcastChangedEvent();
    return this.childFilters.length - 1;
  }

  public remove(filter: IFilterCollection<T>): number {
    const index = this.childFilters.indexOf(filter);
    if (index === -1) {
      return 0;
    }

    this.childFilters.splice(index, 1);
    filter.onChanged = () => {};

    this.broadcastChangedEvent();
    return 1;
  }

  public getFilterAtIndex(index: number): IFilterCollection<T> | undefined {
    return this.childFilters[index];
  }

  public num(): number {
    return this.childFilters.length;
  }

  public passesAllFilters(item: T): boolean {
    return this.childFilters.every(filter => filter.passesFilter(item));
  }

  public onChanged(callback: () => void): void {
    this.changedEventCallbacks.push(callback);
  }

  private broadcastChangedEvent(): void {
    this.changedEventCallbacks.forEach(callback => callback());
  }

  private onChildFilterChanged(): void {
    this.broadcastChangedEvent();
  }
}

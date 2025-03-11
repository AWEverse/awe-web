type Selector<T, U> = (state: T) => U;
type Listener<U> = (value: U) => void;

interface Subscription<T, U> {
  selector: Selector<T, U>;
  listener: Listener<U>;
  prevValue: U;
}

export default class Store<T, A> {
  private state: T;
  private subscriptions: Set<Subscription<T, any>> = new Set();
  private reducer: (state: T, action: A) => T;

  constructor(initialState: T, reducer: (state: T, action: A) => T) {
    this.state = initialState;
    this.reducer = reducer;
  }

  getState(): T {
    return this.state;
  }

  dispatch(action: A): void {
    this.state = this.reducer(this.state, action);
    this.notifySubscribers();
  }

  subscribe<U>(selector: Selector<T, U>, listener: Listener<U>): () => void {
    const subscription: Subscription<T, U> = {
      selector,
      listener,
      prevValue: selector(this.state),
    };
    this.subscriptions.add(subscription);

    listener(subscription.prevValue);

    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  private notifySubscribers(): void {
    this.subscriptions.forEach(subscription => {
      const newValue = subscription.selector(this.state);

      if (newValue !== subscription.prevValue) {
        subscription.listener(newValue);
        subscription.prevValue = newValue;
      }
    });
  }
}

// An named symbol/brand for detecting Signal instances even when they weren't
// created using the same signals library version.
const SIGNAL_SYMBOL = Symbol.for('signals');

// Flags for Computed and Effect.
const RUNNING = 1 << 0; // 1
const NOTIFIED = 1 << 1; // 2
const OUTDATED = 1 << 2; // 3
const DISPOSED = 1 << 3; // 4
const HAS_ERROR = 1 << 4; // 5
const TRACKING = 1 << 5; // 6

enum EVersion {
  NotUsed = -1, // Node is not reused
  Current = 0, // Current active version
}

// Узел связанного списка, используемый для отслеживания зависимостей (источников) и зависимостей (целей).
// Также используется для запоминания последнего номера версии источника, который видела цель.
type Node = {
  // Источник, от значения которого зависит цель.
  _source: Signal;
  _prevSource?: Node;
  _nextSource?: Node;

  // Цель, которая зависит от источника и должна быть уведомлена при изменении источника.
  _target: Computed | Effect;
  _prevTarget?: Node;
  _nextTarget?: Node;

  // Номер версии источника, который последний раз видела цель. Мы используем номера версий
  // вместо хранения исходного значения, поскольку исходные значения могут занимать произвольное количество
  // памяти, а вычисляемые объекты могут зависать на них вечно, поскольку они лениво оцениваются.
  // Используйте специальное значение -1, чтобы отметить потенциально неиспользуемые, но пригодные для повторного использования узлы.
  _version: number;

  // Используется для запоминания и отката предыдущего значения `._node` источника при входе и
  // выходе из нового контекста оценки.
  _rollbackNode?: Node;
};

function startBatch() {
  batchDepth++;
}

function endBatch() {
  if (batchDepth > 1) {
    batchDepth--;
    return;
  }

  let error: unknown;
  let hasError = false;

  while (batchedEffect !== undefined) {
    let effect: Effect | undefined = batchedEffect;
    batchedEffect = undefined;

    batchIteration++;

    while (effect !== undefined) {
      const next: Effect | undefined = effect._nextBatchedEffect;

      effect._nextBatchedEffect = undefined;
      effect._flags &= ~NOTIFIED;

      if (!(effect._flags & DISPOSED) && needsToRecompute(effect)) {
        try {
          effect._callback();
        } catch (err) {
          if (!hasError) {
            error = err;
            hasError = true;
          }
        }
      }

      effect = next;
    }
  }

  batchIteration = 0;
  batchDepth--;

  if (hasError) {
    throw error;
  }
}

/**
 * Объедините несколько обновлений значений в один «коммит» в конце предоставленного обратного вызова.
 *
 * Пакеты могут быть вложенными, и изменения сбрасываются только после завершения обратного вызова самого внешнего пакета.
 *
 * Доступ к сигналу, который был изменен в пакете, отразит его обновленное
 * значение.
 *
 * @param fn The callback function.
 * @returns The value returned by the callback.
 */
function batch<T>(fn: () => T): T {
  if (batchDepth > 0) {
    return fn();
  }
  /*@__INLINE__**/ startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}
// Текущее вычисление или эффект.
let evalContext: Computed | Effect | undefined = undefined;

/**
 * Запустите функцию обратного вызова, которая может получить доступ к значениям сигнала без
 * подписки на обновления сигнала.
 *
 * @param fn The callback function.
 * @returns The value returned by the callback.
 */
function untracked<T>(fn: () => T): T {
  const prevContext = evalContext;
  evalContext = undefined;

  try {
    return fn();
  } finally {
    evalContext = prevContext;
  }
}

// Effects collected into a batch.
let batchedEffect: Effect | undefined = undefined;
let batchDepth = 0;
let batchIteration = 0;

// Глобальный номер версии для сигналов, используемый для быстрого повторения вызовов
// computed.peek()/computed.value, когда ничего не изменилось глобально.
let globalVersion = 0;

function addDependency(signal: Signal): Node | undefined {
  if (evalContext === undefined) {
    return undefined;
  }

  let node = signal._node;
  if (node === undefined || node._target !== evalContext) {
    /**
     * `signal` — это новая зависимость. Создайте новый узел зависимости и установите его
     * как хвост списка зависимостей текущего контекста. Например:
     *
     * { A <-> B       }
     *         ↑     ↑
     *        tail  node (new)
     *               ↓
     * { A <-> B <-> C }
     *               ↑
     *              tail (evalContext._sources)
     */
    node = {
      _version: EVersion.Current,
      _source: signal,
      _prevSource: evalContext._sources,
      _nextSource: undefined,
      _target: evalContext,
      _prevTarget: undefined,
      _nextTarget: undefined,
      _rollbackNode: node,
    };

    if (evalContext._sources !== undefined) {
      evalContext._sources._nextSource = node;
    }

    evalContext._sources = node;
    signal._node = node;

    // Подписаться на уведомления об изменениях из этой зависимости, если мы находимся в эффекте
    // ИЛИ оцениваем вычисленный сигнал, который в свою очередь имеет подписчиков.
    if (evalContext._flags & TRACKING) {
      signal._subscribe(node);
    }
    return node;
  } else if (node._version === EVersion.NotUsed) {
    // `signal` — это существующая зависимость от предыдущей оценки. Используйте ее повторно.
    node._version = EVersion.Current;

    /**
     * Если `node` еще не является текущим хвостом списка зависимостей (т.е.
     * в списке есть следующий узел), то сделайте `node` новым хвостом. например:
     *
     * { A <-> B <-> C <-> D }
     *         ↑           ↑
     *        node   ┌─── tail (evalContext._sources)
     *         └─────│─────┐
     *               ↓     ↓
     * { A <-> C <-> D <-> B }
     *                     ↑
     *                    tail (evalContext._sources)
     */
    if (node._nextSource !== undefined) {
      node._nextSource._prevSource = node._prevSource;

      if (node._prevSource !== undefined) {
        node._prevSource._nextSource = node._nextSource;
      }

      node._prevSource = evalContext._sources;
      node._nextSource = undefined;

      evalContext._sources!._nextSource = node;
      evalContext._sources = node;
    }

    // Мы можем предположить, что текущий оцениваемый эффект / вычисляемый сигнал уже
    // подписан на уведомления об изменении от `signal`, если это необходимо.
    return node;
  }

  return undefined;
}

/**
 * Базовый класс для простых и вычисляемых сигналов.
 */
// @ts-ignore: "Cannot redeclare exported variable 'Signal'."
//
// Функция с тем же именем определяется позже, поэтому нам нужно игнорировать предупреждение TypeScript
// о переобъявленной переменной.
//
// Класс объявляется здесь, но позже реализуется с помощью прототипов в стиле ES5.
// Это позволяет лучше контролировать размер транспилированного вывода.
declare class Signal<T = any> {
  /** @internal */
  _value: unknown;

  /**
   * @internal
   * Номера версий всегда должны быть >= 0, поскольку специальное значение -1 используется
   * узлами для обозначения потенциально неиспользуемых, но пригодных для повторного использования узлов.
   */
  _version: number;

  /** @internal */
  _node?: Node;

  /** @internal */
  _targets?: Node;

  constructor(value?: T);

  /** @internal */
  _refresh(): boolean;

  /** @internal */
  _subscribe(node: Node): void;

  /** @internal */
  _unsubscribe(node: Node): void;

  subscribe(fn: (value: T) => void): () => void;

  valueOf(): T;

  toString(): string;

  toJSON(): T;

  peek(): T;

  brand: typeof SIGNAL_SYMBOL;

  get value(): T;
  set value(value: T);
}

/** @internal */
// @ts-ignore: "Cannot redeclare exported variable 'Signal'."
//
// Класс с таким же именем уже был объявлен, поэтому нам нужно игнорировать
// предупреждение TypeScript о повторно объявленной переменной.
//
// Ранее объявленный класс реализован здесь с помощью прототипов в стиле ES5.
// Это позволяет лучше контролировать размер транспилированного вывода.
function Signal(this: Signal, value?: unknown) {
  this._value = value;
  this._version = EVersion.Current;
  this._node = undefined;
  this._targets = undefined;
}

Signal.prototype.brand = SIGNAL_SYMBOL;

Signal.prototype._refresh = function () {
  return true;
};

Signal.prototype._subscribe = function (node) {
  if (this._targets !== node && node._prevTarget === undefined) {
    node._nextTarget = this._targets;

    if (this._targets !== undefined) {
      this._targets._prevTarget = node;
    }

    this._targets = node;
  }
};

Signal.prototype._unsubscribe = function (node) {
  // Выполняйте шаг отмены подписки только в том случае, если у сигнала изначально есть подписчики.
  if (this._targets !== undefined) {
    const prev = node._prevTarget;
    const next = node._nextTarget;

    if (prev !== undefined) {
      prev._nextTarget = next;
      node._prevTarget = undefined;
    }

    if (next !== undefined) {
      next._prevTarget = prev;
      node._nextTarget = undefined;
    }

    if (node === this._targets) {
      this._targets = next;
    }
  }
};

Signal.prototype.subscribe = function (fn) {
  return effect(() => {
    const value = this.value;

    const prevContext = evalContext;
    evalContext = undefined;

    try {
      fn(value);
    } finally {
      evalContext = prevContext;
    }
  });
};

Signal.prototype.valueOf = function () {
  return this.value;
};

Signal.prototype.toString = function () {
  return this.value + '';
};

Signal.prototype.toJSON = function () {
  return this.value;
};

Signal.prototype.peek = function () {
  const prevContext = evalContext;
  evalContext = undefined;

  try {
    return this.value;
  } finally {
    evalContext = prevContext;
  }
};

Object.defineProperty(Signal.prototype, 'value', {
  get(this: Signal) {
    const node = addDependency(this);
    if (node !== undefined) {
      node._version = this._version;
    }
    return this._value;
  },
  set(this: Signal, value) {
    if (value !== this._value) {
      if (batchIteration > 100) {
        throw new Error('Cycle detected');
      }

      this._value = value;
      this._version++;
      globalVersion++;

      /**@__INLINE__*/ startBatch();
      try {
        let currentNode = this._targets;

        while (currentNode != undefined) {
          currentNode._target._notify();
          currentNode = currentNode._nextTarget;
        }
      } finally {
        endBatch();
      }
    }
  },
});

/**
 * Create a new plain signal.
 *
 * @param value The initial value for the signal.
 * @returns A new signal.
 */
export function signal<T>(value: T): Signal<T>;
export function signal<T = undefined>(): Signal<T | undefined>;
export function signal<T>(value?: T): Signal<T> {
  return new Signal(value);
}

function needsToRecompute(target: Computed | Effect): boolean {
  // Проверьте зависимости на предмет измененных значений. Список зависимостей уже
  // в порядке использования. Поэтому, если несколько зависимостей изменили значения, только
  // первая использованная зависимость переоценивается в этой точке.
  for (let node = target._sources; node !== undefined; node = node._nextSource) {
    // Если есть новая версия зависимости до или после обновления,
    // или зависимость имеет что-то, что блокирует ее обновление вообще (например,
    // цикл зависимости), то нам нужно пересчитать.
    const source = node._source;

    // Если версия источника изменилась, или обновление не удалось, или версия снова изменилась
    if (source._version !== node._version || !source._refresh()) {
      return true; // Требуется пересчет, так как зависимость изменилась
    }

    // Если версия источника снова изменилась после попытки обновления
    if (source._version !== node._version) {
      return true;
    }
  }

  // Если ни одна зависимость не изменилась, пересчитывать не нужно
  return false;
}

function prepareSources(target: Computed | Effect) {
  /**
   * 1. Отметить все текущие источники как повторно используемые узлы (версия: -1)
   * 2. Установить узел отката, если текущий узел используется в другом контексте
   * 3. Указать 'target._sources' на хвост двусвязного списка, например:
   *
   *    { undefined <- A <-> B <-> C -> undefined }
   *                   ↑           ↑
   *                   │           └──────┐
   * target._sources = A; (node is head)  │
   *                   ↓                  │
   * target._sources = C; (node is tail) ─┘
   */
  let currentNode = target._sources;

  while (currentNode !== undefined) {
    const sourceNode = currentNode._source._node;

    if (sourceNode !== undefined) {
      currentNode._rollbackNode = sourceNode;
    }

    // Mark the source node as the current node
    currentNode._source._node = currentNode;

    // Mark the node as reusable (version: -1)
    currentNode._version = EVersion.NotUsed;

    // If the next source node is undefined,
    // set the target._sources to the current node
    if (currentNode._nextSource === undefined) {
      target._sources = currentNode;
      break;
    }

    // Move to the next source node
    currentNode = currentNode._nextSource;
  }
}

function cleanupSources(target: Computed | Effect) {
  let currentNode = target._sources;
  let newHead = undefined;

  /**
   * В этот момент 'target._sources' указывает на хвост двусвязного списка.
   * Он содержит все существующие источники + новые источники в порядке использования.
   * Итерируем в обратном порядке, пока не найдем головной узел, отбрасывая старые зависимости.
   */
  while (currentNode !== undefined) {
    const previousNode = currentNode._prevSource;

    /**
     * Узел не был повторно использован, отпишитесь от уведомлений об его изменении и удалите себя
     * из двусвязного списка. например:
     *
     * { A <-> B <-> C }
     *         ↓
     *    { A <-> C }
     */
    if (currentNode._version === EVersion.NotUsed) {
      currentNode._source._unsubscribe(currentNode);

      if (previousNode !== undefined) {
        previousNode._nextSource = currentNode._nextSource;
      }

      if (currentNode._nextSource !== undefined) {
        currentNode._nextSource._prevSource = previousNode;
      }
    } else {
      /**
       * Новый заголовок — это последний увиденный узел, который не был удален/отписан
       * из двусвязного списка. Например:
       *
       * { A <-> B <-> C }
       *   ↑     ↑     ↑
       *   │     │     └ newHead = currentNode
       *   │     └ newHead = currentNode
       *   └ newHead = currentNode
       */
      newHead = currentNode;
    }

    currentNode._source._node = currentNode._rollbackNode;

    if (currentNode._rollbackNode !== undefined) {
      currentNode._rollbackNode = undefined;
    }

    // Move to the previous node in the linked list
    currentNode = previousNode;
  }

  target._sources = newHead;
}

declare class Computed<T = any> extends Signal<T> {
  _fn: () => T;
  _sources?: Node;
  _globalVersion: number;
  _flags: number;

  constructor(fn: () => T);

  _notify(): void;
  get value(): T;
}

function Computed(this: Computed, fn: () => unknown) {
  Signal.call(this, undefined);

  this._fn = fn;
  this._sources = undefined;
  this._globalVersion = globalVersion - 1;
  this._flags = OUTDATED;
}

Computed.prototype = new Signal() as Computed;

Computed.prototype._refresh = function () {
  this._flags &= ~NOTIFIED;

  if (this._flags & RUNNING) {
    return false;
  }

  // Если этот вычисляемый сигнал подписался на обновления от своих зависимостей
  // (установлен флаг TRACKING) и ни один из них не уведомил об изменениях (устаревший
  // флаг не установлен), то вычисляемое значение не могло измениться.
  if ((this._flags & (OUTDATED | TRACKING)) === TRACKING) {
    return true;
  }

  this._flags &= ~OUTDATED;

  if (this._globalVersion === globalVersion) {
    return true;
  }

  this._globalVersion = globalVersion;

  // Отметьте этот вычисленный сигнал как работающий перед проверкой зависимостей на предмет изменений значения
  // чтобы флаг RUNNING можно было использовать для обнаружения циклических зависимостей.
  this._flags |= RUNNING;

  if (this._version > EVersion.Current && !needsToRecompute(this)) {
    this._flags &= ~RUNNING;
    return true;
  }

  const prevContext = evalContext;

  try {
    prepareSources(this);

    evalContext = this;
    const value = this._fn();

    if (this._flags & HAS_ERROR || this._value !== value || this._version === EVersion.Current) {
      this._value = value;
      this._flags &= ~HAS_ERROR;
      this._version++;
    }
  } catch (err) {
    this._value = err;
    this._flags |= HAS_ERROR;
    this._version++;
  }

  evalContext = prevContext;
  cleanupSources(this);
  this._flags &= ~RUNNING;
  return true;
};

Computed.prototype._subscribe = function (node) {
  if (this._targets === undefined) {
    this._flags |= OUTDATED | TRACKING;

    // Вычисляемый сигнал лениво подписывается на свои зависимости, когда он
    // получает своего первого подписчика.
    for (let node = this._sources; node !== undefined; node = node._nextSource) {
      node._source._subscribe(node);
    }
  }
  Signal.prototype._subscribe.call(this, node);
};

Computed.prototype._unsubscribe = function (node) {
  // Выполнять шаг отмены подписки только в том случае, если у вычисляемого сигнала есть подписчики.
  if (this._targets !== undefined) {
    Signal.prototype._unsubscribe.call(this, node);

    // Вычисляемый сигнал отписывается от своих зависимостей, когда теряет своего последнего подписчика.
    // Это позволяет собирать мусор для нереференсных подграфов вычисляемых сигналов.
    if (this._targets === undefined) {
      this._flags &= ~TRACKING;

      for (let node = this._sources; node !== undefined; node = node._nextSource) {
        node._source._unsubscribe(node);
      }
    }
  }
};

Computed.prototype._notify = function () {
  if (!(this._flags & NOTIFIED)) {
    this._flags |= OUTDATED | NOTIFIED;

    for (let node = this._targets; node !== undefined; node = node._nextTarget) {
      node._target._notify();
    }
  }
};

Object.defineProperty(Computed.prototype, 'value', {
  get(this: Computed) {
    if (this._flags & RUNNING) {
      throw new Error('Cycle detected');
    }

    const node = addDependency(this);
    this._refresh();
    if (node !== undefined) {
      node._version = this._version;
    }

    if (this._flags & HAS_ERROR) {
      throw this._value;
    }
    return this._value;
  },
});

/**
 * Интерфейс для сигналов, доступных только для чтения.
 */
interface ReadonlySignal<T = any> {
  readonly value: T;
  peek(): T;

  subscribe(fn: (value: T) => void): () => void;
  valueOf(): T;
  toString(): string;
  toJSON(): T;
  brand: typeof SIGNAL_SYMBOL;
}

/**
 * Создайте новый сигнал, который вычисляется на основе значений других сигналов.
 *
 * Возвращаемый вычисленный сигнал доступен только для чтения, и его значение автоматически
 * обновляется при изменении любых сигналов, к которым осуществляется доступ из функции обратного вызова.
 *
 * @param fn The effect callback.
 * @returns A new read-only signal.
 */
function computed<T>(fn: () => T): ReadonlySignal<T> {
  return new Computed(fn);
}

// Effects
function cleanupEffect(effect: Effect) {
  const cleanup = effect._cleanup;
  effect._cleanup = undefined;

  if (typeof cleanup === 'function') {
    /*@__INLINE__**/ startBatch();

    // Run cleanup functions always outside of any context.
    const prevContext = evalContext;
    evalContext = undefined;

    try {
      cleanup();
    } catch (err) {
      effect._flags &= ~RUNNING;
      effect._flags |= DISPOSED;
      disposeEffect(effect);
      throw err;
    } finally {
      evalContext = prevContext;
      endBatch();
    }
  }
}

function disposeEffect(effect: Effect) {
  for (let node = effect._sources; node !== undefined; node = node._nextSource) {
    node._source._unsubscribe(node);
  }

  effect._fn = undefined;
  effect._sources = undefined;

  cleanupEffect(effect);
}

function endEffect(this: Effect, prevContext?: Computed | Effect) {
  if (evalContext !== this) {
    throw new Error('Out-of-order effect');
  }
  cleanupSources(this);
  evalContext = prevContext;

  this._flags &= ~RUNNING;
  if (this._flags & DISPOSED) {
    disposeEffect(this);
  }
  endBatch();
}

type EffectFn = () => void | (() => void);

type CleanupEffectFn = () => void;

declare class Effect {
  _fn?: EffectFn;
  _cleanup?: () => void;
  _sources?: Node;
  _nextBatchedEffect?: Effect;
  _flags: number;

  constructor(fn: EffectFn);

  _callback(): void;
  _start(): CleanupEffectFn;
  _notify(): void;
  _dispose(): void;
}

function Effect(this: Effect, fn: EffectFn) {
  this._fn = fn;
  this._cleanup = undefined;
  this._sources = undefined;
  this._nextBatchedEffect = undefined;
  this._flags = TRACKING;
}

Effect.prototype._callback = function () {
  const finish = this._start();

  try {
    if (this._flags & DISPOSED) return;
    if (this._fn === undefined) return;

    const cleanup = this._fn();

    if (typeof cleanup === 'function') {
      this._cleanup = cleanup;
    }
  } finally {
    finish();
  }
};

Effect.prototype._start = function () {
  if (this._flags & RUNNING) {
    throw new Error('Cycle detected');
  }

  this._flags |= RUNNING;
  this._flags &= ~DISPOSED;

  cleanupEffect(this);
  prepareSources(this);

  /*@__INLINE__**/ startBatch();
  const prevContext = evalContext;
  evalContext = this;

  return endEffect.bind(this, prevContext);
};

Effect.prototype._notify = function () {
  if (!(this._flags & NOTIFIED)) {
    this._flags |= NOTIFIED;
    this._nextBatchedEffect = batchedEffect;
    batchedEffect = this;
  }
};

Effect.prototype._dispose = function () {
  this._flags |= DISPOSED;

  if (!(this._flags & RUNNING)) {
    disposeEffect(this);
  }
};

/**
 * Создайте эффект для запуска произвольного кода в ответ на изменения сигнала.
 *
 * Эффект отслеживает, к каким сигналам осуществляется доступ в заданной функции обратного вызова
 * `fn`, и повторно запускает обратный вызов при изменении этих сигналов.
 *
 * Функция обратного вызова может возвращать функцию очистки. Функция очистки
 * запускается один раз, либо при следующем вызове функции обратного вызова, либо при удалении эффекта,
 * в зависимости от того, что произойдет раньше.
 *
 * @param fn The effect callback.
 * @returns A function for disposing the effect.
 */
function effect(fn: EffectFn): () => void {
  const effect = new Effect(fn);

  try {
    effect._callback();
  } catch (err) {
    effect._dispose();
    throw err;
  }
  // Возвращает связанную функцию вместо оболочки типа `() => effect._dispose()`,
  // потому что связанные функции кажутся такими же быстрыми и занимают гораздо меньше памяти.
  return effect._dispose.bind(effect);
}

// We may land a more comprehensive "Deep" Reactive in core,
// since "Shallow" Reactive is trivial to implement atop Signal:
type ISignalObject<T> = { [K in keyof T]: Signal<T[K]> };

// Желательно, пока не пихать целые обьекты в сигналы
export function reactiveObject<T extends object>(obj: T) {
  let reactive = {} as ISignalObject<T>;

  for (let i in obj) {
    reactive[i] = signal(obj[i]);
  }

  return reactive;
}

export { computed, effect, batch, untracked, Signal, type ReadonlySignal, type ISignalObject };

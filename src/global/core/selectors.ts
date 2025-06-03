import { useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../core";
import { useAppSelector } from "../core/hooks";

/**
 * Типизированный создатель селекторов с автоматическим выводом типов
 */
export function createTypedSelector<T>(
  selector: (state: RootState) => T,
) {
  return selector;
}

/**
 * Создает мемоизированный селектор с зависимостями
 */
export function createMemoizedSelector<Args extends readonly unknown[], Return>(
  selectors: readonly [...{ [K in keyof Args]: (state: RootState) => Args[K] }],
  combiner: (...args: Args) => Return,
) {
  return createSelector([...selectors] as [...{ [K in keyof Args]: (state: RootState) => Args[K] }], combiner);
}

/**
 * Хук для создания селектора на лету с мемоизацией
 */
export function useCreateSelector<T>(
  selectorFactory: () => (state: RootState) => T,
  deps: React.DependencyList,
) {
  const selector = useMemo(selectorFactory, deps);
  return useAppSelector(selector);
}

/**
 * Утилита для создания селекторов по ключу состояния
 */
export function createStateKeySelector<K extends keyof RootState>(key: K) {
  return (state: RootState) => state[key];
}

/**
 * Создает селектор для вложенного свойства
 */
export function createNestedSelector<
  K extends keyof RootState,
  P extends keyof RootState[K],
>(stateKey: K, propertyKey: P) {
  return createSelector(
    [(state: RootState) => state[stateKey]],
    (stateSlice) => stateSlice[propertyKey],
  );
}

/**
 * Создает селектор для массива свойств
 */
export function createMultiPropertySelector<
  K extends keyof RootState,
  P extends readonly (keyof RootState[K])[],
>(
  stateKey: K,
  propertyKeys: P,
) {
  return createSelector(
    [(state: RootState) => state[stateKey]],
    (stateSlice) => {
      const result = {} as { [Key in P[number]]: RootState[K][Key] };
      propertyKeys.forEach((key) => {
        result[key as P[number]] = stateSlice[key as P[number]];
      });
      return result;
    },
  );
}

/**
 * Создает селектор с условной логикой
 */
export function createConditionalSelector<T, R>(
  selector: (state: RootState) => T,
  condition: (value: T) => boolean,
  trueSelector: (value: T) => R,
  falseSelector: (value: T) => R,
) {
  return createSelector(
    [selector],
    (value) => (condition(value) ? trueSelector(value) : falseSelector(value)),
  );
}

/**
 * Типы для селекторов
 */
export type TypedSelector<T> = (state: RootState) => T;
export type SelectorFactory<T, Args extends any[]> = (...args: Args) => TypedSelector<T>;

/**
 * Создает фабрику селекторов с параметрами
 */
export function createSelectorFactory<T, Args extends any[]>(
  factory: (...args: Args) => TypedSelector<T>,
): SelectorFactory<T, Args> {
  const cache = new Map<string, TypedSelector<T>>();

  return (...args: Args) => {
    const key = JSON.stringify(args);

    if (!cache.has(key)) {
      cache.set(key, factory(...args));
    }

    return cache.get(key)!;
  };
}

export function createParametrizedSelector<
  T,
  Args extends any[],
>(
  factory: (...args: Args) => TypedSelector<T>,

): SelectorFactory<T, Args> {
  const cache = new Map<string, TypedSelector<T>>();

  return (...args: Args) => {
    const key = JSON.stringify(args);

    if (!cache.has(key)) {
      cache.set(key, factory(...args));
    }

    return cache.get(key)!;
  };
}

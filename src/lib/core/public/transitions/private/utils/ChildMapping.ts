import { ReactNode, isValidElement, Children } from 'react';

type IMapFn = (child: React.ReactElement) => React.ReactElement;

/**
 * Returns a new object with the keys of the children as the keys and the values as the children
 * @param children
 * @param mapFn
 */
export function getChildMapping(children: ReactNode | undefined, mapFn?: IMapFn): IChildMapping {
  const result: IChildMapping = Object.create(null);

  if (!children) return result;

  Children.forEach(children, child => {
    if (isValidElement(child) && child.key !== null) {
      result[child.key as string] = mapFn ? mapFn(child) : child;
    }
  });

  return result;
}

type IChildMapping = Record<string, ReactNode>;

function getValueForKey(key: string, prev: IChildMapping, next: IChildMapping): ReactNode {
  if (next.hasOwnProperty(key)) {
    return next[key];
  }

  return prev[key];
}
/**
 * Когда вы добавляете или удаляете дочерние элементы, некоторые из них могут быть добавлены или удалены в
 * одном и том же проходе рендеринга. Мы хотим показать *оба*, поскольку хотим одновременно
 * анимировать элементы внутрь и наружу. Эта функция берет предыдущий набор ключей
 * и новый набор ключей и объединяет их с наилучшим предположением о правильном
 * порядке. В будущем мы можем раскрыть некоторые утилиты в
 * ReactMultiChild, чтобы упростить это, но сейчас сам React не
 * напрямую имеет эту концепцию объединения prevChildren и nextChildren
 * поэтому мы реализуем ее здесь.
 *
 * @param {object} prev prev children как возвращается из
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} next next children как возвращается из
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @return {object} набор ключей, содержащий все ключи в `prev` и все ключи
 * в `next` в разумном порядке.
 */
export function mergeChildMappings(prev: IChildMapping, next: IChildMapping): IChildMapping {
  prev = prev || Object.create(null);
  next = next || Object.create(null);

  // Сначала добавим новые ключи
  const nextKeysPending = Object.create(null);

  let pendingKeys: string[] = [];

  for (const prevKey in prev) {
    if (prevKey in next) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = [...pendingKeys];
        pendingKeys.length = 0;
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }

  let childMapping: IChildMapping = {};

  for (let nextKey in next) {
    if (nextKeysPending[nextKey]) {
      for (let i = 0; i < nextKeysPending[nextKey].length; i++) {
        let pendingNextKey = nextKeysPending[nextKey][i];

        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey, prev, next);
      }
    }

    childMapping[nextKey] = getValueForKey(nextKey, prev, next);
  }

  // Finally, add the keys which didn't appear before any key in `next`
  for (let i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i], prev, next);
  }

  return childMapping;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type OrderDirection = 'asc' | 'desc';

function getOrderValue<T>(item: T, orderRule: keyof T | ((item: T) => any)): any {
  return (typeof orderRule === 'function' ? orderRule(item) : item[orderRule]) || 0;
}

export function orderBy<T>(
  collection: T[],
  orderRule: keyof T | ((item: T) => any) | (keyof T | ((item: T) => any))[],
  mode: OrderDirection | [OrderDirection, OrderDirection] = 'asc',
): T[] {
  function compareValues(a: T, b: T, currentOrderRule: keyof T | ((item: T) => any), isAsc: boolean) {
    const aValue = getOrderValue(a, currentOrderRule);
    const bValue = getOrderValue(b, currentOrderRule);
    return isAsc ? aValue - bValue : bValue - aValue;
  }

  if (Array.isArray(orderRule)) {
    const [mode1, mode2] = Array.isArray(mode) ? mode : [mode, mode];
    const [orderRule1, orderRule2] = orderRule;
    const isAsc1 = mode1 === 'asc';
    const isAsc2 = mode2 === 'asc';
    return collection.sort((a, b) => compareValues(a, b, orderRule1, isAsc1) || compareValues(a, b, orderRule2, isAsc2));
  }

  const isAsc = mode === 'asc';
  return collection.sort((a, b) => compareValues(a, b, orderRule, isAsc));
}

import { ReactNode } from 'react';

export function replaceWithReactNode(
  input: string,
  searchValue: string | RegExp,
  replaceValue: ReactNode,
): ReactNode[] {
  const parts =
    typeof searchValue === 'string' ? input.split(searchValue) : input.split(searchValue);

  const result: ReactNode[] = [];

  parts.forEach((part, index) => {
    result.push(part);

    if (index < parts.length - 1) {
      result.push(replaceValue);
    }
  });

  return result;
}

export function replaceInStringsWithReactNode(
  input: ReactNode[],
  searchValue: string | RegExp,
  replaceValue: ReactNode,
): ReactNode[] {
  return input
    .map((curr: ReactNode) => {
      if (typeof curr === 'string') {
        return replaceWithReactNode(curr, searchValue, replaceValue);
      }

      return curr;
    })
    .flat();
}

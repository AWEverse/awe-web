type BranchCases<
  Key extends string,
  Value extends string,
  Callback extends NoneToAnyFunction,
> = {
  [K in Key]: Record<Value, Callback>;
};

const branch = <
  K extends string,
  V extends string,
  C extends BranchCases<K, V, NoneToAnyFunction>,
>(
  cases: C,
) => {
  const key = Object.keys(cases)[0] as K;

  return (request: { [P in K]: V }): ReturnType<C[K][V]> =>
    cases[key][request[key]]?.();
};

export default branch;

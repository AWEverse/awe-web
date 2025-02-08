// Тип для вложенной конфигурации ветвления:
// Каждая конфигурация — это объект с единственным ключом,
// значение которого представляет словарь: ключи — строковые литералы,
// а значения — либо функция, либо снова вложенная конфигурация.
type BranchConfig = {
  [key: string]: {
    [value: string]: NoneToAnyFunction | BranchConfig;
  };
};

// Рекурсивная функция branch: она принимает конфигурацию, проверяет,
// что на данном уровне имеется ровно один ключ, и возвращает функцию,
// которая принимает объект запроса. При этом, если найденный кейс — функция,
// она вызывается; если объект — значит, это вложенное ветвление, и
// функция вызывает себя рекурсивно.
const branch = (cases: BranchConfig) => {
  const keys = Object.keys(cases);

  if (keys.length !== 1) {
    throw new Error(
      "A branching configuration must consist of a single key at the peer level",
    );
  }

  const key = keys[0];

  return (request: Record<string, string>): any => {
    const value = request[key];
    const chosen = cases[key][value];

    if (!chosen)
      throw new Error(`No handler for key "${key}" with value "${value}"`);

    if (typeof chosen === "function") {
      return chosen();
    } else {
      return branch(chosen)(request);
    }
  };
};

export default branch;

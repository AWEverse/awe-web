import { noop } from "../utils/listener";

export type LogFunction = (...args: Array<unknown>) => void;

export type LoggerType = {
  fatal: LogFunction;
  error: LogFunction;
  warn: LogFunction;
  info: LogFunction;
  debug: LogFunction;
  trace: LogFunction;
};

export enum LogLevel {
  Fatal = 60,
  Error = 50,
  Warn = 40,
  Info = 30,
  Debug = 20,
  Trace = 10,
}

type LogAtLevelFnType = (
  level: LogLevel,
  ...args: ReadonlyArray<unknown>
) => void;

// По умолчанию logAtLevel установлен в noop.
// Используем проверку на ссылочное равенство для определения, инициализирован ли логгер.
let logAtLevel: LogAtLevelFnType = noop;

/**
 * Фабрика для создания логирующих функций по уровню.
 * @param level - уровень логирования
 * @returns функцию логирования, которая вызывает logAtLevel с указанным уровнем
 */
function createLogFunction(level: LogLevel): LogFunction {
  return (...args: Array<unknown>) => logAtLevel(level, ...args);
}

export const fatal: LogFunction = createLogFunction(LogLevel.Fatal);
export const error: LogFunction = createLogFunction(LogLevel.Error);
export const warn: LogFunction = createLogFunction(LogLevel.Warn);
export const info: LogFunction = createLogFunction(LogLevel.Info);
export const debug: LogFunction = createLogFunction(LogLevel.Debug);
export const trace: LogFunction = createLogFunction(LogLevel.Trace);

/**
 * Устанавливает низкоуровневый интерфейс логирования.
 * Вызывается на ранних этапах жизненного цикла процесса и может быть выполнен только один раз.
 *
 * @param log - функция, осуществляющая логирование по заданному уровню
 * @throws Error если логгер уже был инициализирован
 */
export function setLogAtLevel(log: LogAtLevelFnType): void {
  if (logAtLevel !== noop) {
    throw new Error('Logger has already been initialized');
  }
  logAtLevel = log;
}

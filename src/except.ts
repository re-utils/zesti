const symbol = Symbol();

export type Exception = StaticException | DynamicExceptionInstance<any>;
export type StaticException = [symbol, number];
export type DynamicExceptionInstance<T> = [symbol, number, T];
export type DynamicException<T> = (payload: T) => DynamicExceptionInstance<T>;

export type ExcludeExceptionType<T> = Exclude<T, Exception>;

let errorId = 1;

/**
 * Create a static error type
 */

export const staticException = (): StaticException => [symbol, errorId++];

/**
 * Create a dynamic error type
 */
export const dynamicException = <T>(): DynamicException<T> => {
  const id = errorId++;
  return (payload: T) => [symbol, id, payload];
};

export const isException = (x: any): x is Exception => Array.isArray(x) && x[0] === symbol;

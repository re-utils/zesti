import type { AnyState } from '.';
import type { Handler } from './types/route';

export type StaticError = [symbol];

/**
 * Create an error with no payload
 */
export const staticError = (): StaticError => [Symbol()];

export interface DynamicError<T = unknown> {
  i: symbol;
  init: (payload: T) => [symbol, T];
}

const dynamicProto = {
  i: null,
  init(p: any) {
    return [this.i, p];
  }
};

/**
 * Create an error with payload
 */
export const dynamicError = <T>(): DynamicError<T> => {
  const o = Object.create(dynamicProto);
  // eslint-disable-next-line
  o.i = Symbol();
  return o;
};

export type AnyError = StaticError | DynamicError;
export type AnyErrorValue = StaticError | ReturnType<DynamicError['init']>;

export type DynamicErrorHandler<T, State extends AnyState = {}> = Handler<State, [payload: T]>;
export type ErrorHandlerData = [symbol, Handler<any> | DynamicErrorHandler<any>];

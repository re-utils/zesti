import type { AnyErrorValue, ErrorHandlerData } from '../error';
import type { Context } from '../types/route';

// eslint-disable-next-line
const AsyncFunction = (async () => { }).constructor;
export const isAsync = (t: any): t is (...args: any[]) => Promise<any> => t instanceof AsyncFunction;

export type ErrorSet = Map<symbol, ErrorHandlerData[1]>;
export const handleErrors = (errSet: ErrorSet, fallback: ErrorHandlerData[1], err: AnyErrorValue, c: Context): any => {
  const fn = errSet.get(err[0]);
  return typeof fn === 'undefined'
    // @ts-expect-error Error is static here
    ? fallback(c)
    : err.length === 2
      ? fn(err[1], c)
      // @ts-expect-error Error is static here
      : fn(c);
};

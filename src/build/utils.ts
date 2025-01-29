import type { AnyErrorValue, ErrorHandlerData } from '../error';
import type { Context } from '../types/route';
import type { AnyFn } from '../types/utils';

import type { Router as BaseRouter } from '@mapl/router';
import match from '@mapl/router/tree/matcher';

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

/**
 * Create a matcher
 */
export const createMatcher = (router: BaseRouter<AnyFn>, nf: (...args: any[]) => Response): (p: string, r: Context) => any => {
  // Slice the first slash out
  const map = new Map(router[0].map((pair) => [pair[0].slice(1), pair[1]]));
  const node = router[1];

  if (node !== null) {
    const oldNf = nf;
    nf = (p: string, c: Context) => {
      const params: string[] = [];
      return (match(node, p, params, -1) as AnyFn | null)?.(params, c) ?? oldNf(p, c);
    };
  }

  return (p: string, c: Context) => map.get(p)?.(c) ?? nf(p, c);
};

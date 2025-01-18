import match from '@mapl/router/tree/matcher';
import type { Router as BaseRouter } from '@mapl/router';
import type { AnyFn } from '../../../types/utils';
import type { Context } from '../../../types/route';

/**
 * Create a matcher
 */
export const matcher = (router: BaseRouter<AnyFn>, nf: (...args: any[]) => Response): (p: string, r: Context) => any => {
  // Slice the first slash out
  const map = Object.fromEntries(router[0].map((pair) => [pair[0].slice(1), pair[1]]));
  const node = router[1];

  return node === null
    ? (p: string, c: Context) => map[p](c) ?? nf(p, c)
    : (p: string, c: Context) => {
      let t: any = map[p];
      if (typeof t === 'undefined') {
        t = [];
        return (match(node, p, t, -1) as AnyFn | null)?.(t, c) ?? nf(p, c);
      }
      return (t as AnyFn)(c);
    };
};

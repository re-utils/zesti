import match from '@mapl/router/tree/matcher';

import type { Router as BaseRouter } from '@mapl/router';
import type { AnyFn } from '../../types/utils';
import type { Context } from '../../types/route';

/**
 * Create a matcher
 */
export const matcher = (router: BaseRouter<AnyFn>, nf: (...args: any[]) => Response): (p: string, r: Context) => any => {
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

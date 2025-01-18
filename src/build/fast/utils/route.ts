import match from '@mapl/router/tree/matcher';
import type { Router as BaseRouter } from '@mapl/router';
import type { AnyFn } from '../../../types/utils';
import type { Context } from '../../../types/route';

/**
 * Create a matcher
 */
export const matcher = (router: BaseRouter<AnyFn>, nf: () => Response): (p: string, r: Context, ...a: any[]) => any => {
  // Slice the first slash out
  const map = Object.fromEntries(router[0].map((pair) => [pair[0].slice(1), pair[1]]));
  const node = router[1];

  return node === null
    ? (p: string, ...a: [Context, ...any[]]) => (map[p] ?? nf)(...a)
    : (p: string, r: Context, ...a: any[]) => {
      const t: any = map[p];
      if (typeof t === 'undefined') {
        const params: string[] = [];
        return (match(node, p, params, -1, p.length) as AnyFn | null ?? nf)(params, ...a);
      }
      return (t as AnyFn)(...a);
    };
};

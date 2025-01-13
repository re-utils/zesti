import type { Context } from '../../types/route';
import match from '@mapl/router/tree/matcher';
import type { Router as BaseRouter } from '@mapl/router';
import type { AnyFn } from '../../types/utils';
import type { Exception } from '../../except';

const [nf, br] = [404, 400].map((s) => new Response(null, { status: s }));
export const notFound = (): Response => nf;
export const badReq = (): Response => br;

/**
 * Create a matcher
 */
export const matcher = (router: BaseRouter<AnyFn>): (p: string, c: Context, ...a: any[]) => any => {
  // Slice the first slash out
  const map = Object.fromEntries(router[0].map((pair) => [pair[0].slice(1), pair[1]]));
  const node = router[1];

  return node === null
    ? (p: string, c: Context, ...a: any[]) => (map[p] ?? notFound)(c, ...a)
    : (p: string, c: Context, ...a: any[]) => {
      const t: any = map[p];
      if (typeof t === 'undefined') {
        const params: string[] = [];
        return (match(node, p, params, -1, p.length) as AnyFn | null ?? notFound)(params, c, ...a);
      }
      return (t as AnyFn)(c, ...a);
    };
};

export const errMatcher = (errs: Record<number, AnyFn>): (c: Context, e: Exception) => any => (c: Context, e: Exception) => e.length === 2
  ? (errs[e[1]] ?? errs[0])(c)
  : (errs[e[1]] ?? errs[0])(e[2], c);

import { createRouter, insertItem, type Router as BaseRouter } from '@mapl/router';

import toHandler from './utils/toHandler';

import type { AnyFn } from '../../types/utils';
import type { BuildFn } from '../types';
import type { AnyMiddlewareFn, AnyRouter } from '../..';
import type { Context, HandlerData } from '../../types/route';

import { matcher } from './utils/route';

type RouteTree = [Record<string, BaseRouter<AnyFn>>, BaseRouter<AnyFn> | null];

const build = (router: AnyRouter, routesTree: RouteTree, cbs: AnyMiddlewareFn[], prefix: string): void => {
  const mds = [...cbs, ...router.m];
  const mdsLen = mds.length;

  for (let i = 0, x: HandlerData, routes = router.r; i < routes.length; i++) {
    x = routes[i];

    const f = toHandler(x[2], x[3]);
    insertItem(
      // @ts-expect-error Hey
      x[0] === null
        // @ts-expect-error Hey
        ? routesTree[1] ??= createRouter()
        // @ts-expect-error Hey
        : routesTree[0][x[0]] ??= createRouter(),

      prefix + x[1],
      mds.length === 0
        ? f
        : x[3]
          ? (p: string[], c: Context) => {
            let idx = 0;
            const next = (): any => idx < mdsLen
              ? mds[idx++](next, c)
              : f(p, c);
            return next();
          }
          : (c: Context) => {
            let idx = 0;
            const next = (): any => idx < mdsLen
              ? mds[idx++](next, c)
              : f(c);
            return next();
          }
    );
  }

  for (let i = 0, x: [string, AnyRouter], routes = router.s; i < routes.length; i++) {
    x = routes[i];
    build(x[1], routesTree, mds, x[0] === '/' ? prefix : prefix + x[0]);
  }
};

/**
 * Build to the fastest handler
 */
export default ((router, adapter) => {
  const routes: RouteTree = [ {}, null];
  build(router, routes, [], '');

  // This doesn't work with Cloudflare if you put it in the global scope
  const nf = new Response(null, { status: 404 });

  // Fallback method
  const fallback = routes[1] === null
    ? () => nf
    : matcher(routes[1], () => nf);

  // Build for registered methods
  const routeMap = new Map(Object.entries(routes[0])
    .map((pair) => [pair[0], matcher(pair[1], fallback)]));

  // No adapter provided
  if (adapter == null) {
    return (r) => {
      const u = r.url;
      const s = u.indexOf('/', 12) + 1;
      const e = u.indexOf('?', s);

      return (routeMap.get(r.method) ?? fallback)(e === -1 ? u.slice(s) : u.substring(s, e), {
        headers: [],
        status: 200,
        req: r
      });
    };
  }

  // Custom adapter
  return (r, ...a: any[]) => {
    const u = r.url;
    const s = u.indexOf('/', 12) + 1;
    const e = u.indexOf('?', s);

    return (routeMap.get(r.method) ?? fallback)(e === -1 ? u.slice(s) : u.substring(s, e), adapter(r, ...a as any));
  };
}) as BuildFn;

/**
 * Implementation note:
 * - Though maps are slower at first, they won't get de-opted if you, for example, request a non-existent path, which causes the original object to be megamorphic
 */

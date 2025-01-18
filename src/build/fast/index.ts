import { createRouter, insertItem, type Router as BaseRouter } from '@mapl/router';
import toHandler from './utils/toHandler';

import type { AnyFn } from '../../types/utils';
import type { BuildFn } from '../types';
import type { AnyMiddlewareFn, AnyRouter } from '../..';
import type { HandlerData } from '../../types/route';
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
          ? (p: string[], ...a: any[]) => {
            let idx = 0;
            const next = (): any => idx < mdsLen
              ? mds[idx++](next, ...a as [any])
              : f(p, ...a);
            return next();
          }
          : (...a: any[]) => {
            let idx = 0;
            const next = (): any => idx < mdsLen
              ? mds[idx++](next, ...a as [any])
              : f(...a);
            return next();
          }
    );
  }
};

/**
 * Build to the fastest the handler
 */
export default ((router) => {
  const routes: RouteTree = [ {}, null];
  build(router, routes, [], '');

  // This doesn't work with Cloudflare if you put it in the global scope
  const nf = new Response(null, { status: 404 });
  const notFound = (): Response => nf;

  // Fallback method
  const fallback = routes[1] === null
    ? notFound
    : matcher(routes[1], notFound);

  // Build for registered methods
  const routeMap = Object.fromEntries(Object.entries(routes[0])
    .map((pair) => [pair[0], matcher(pair[1], fallback as any)]));

  return (r: Request, ...a: any[]): Response | Promise<Response> => {
    const u = r.url;
    const s = u.indexOf('/', 12) + 1;

    return (routeMap[r.method] ?? fallback)(u.substring(s, u.indexOf('?', s) >>> 0), {
      status: 200,
      req: r,
      headers: []
    }, ...a);
  };
}) as BuildFn;

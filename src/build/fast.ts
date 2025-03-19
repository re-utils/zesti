import { createRouter, insertItem, type Router as BaseRouter } from '@mapl/router';
import match from '@mapl/router/tree/matcher';

import type { AnyFn } from '../types/utils';
import type { BuildFn } from './types';
import type { AnyMiddlewareFn, AnyRouter, SubrouterData } from '..';
import type { Context, HandlerData } from '../types/route';
import type { ErrorHandlerData } from '../error';

import context from './context';
import { handleErrors, joinPath, type ErrorSet } from './utils';

type RouteTree = [Record<string, BaseRouter<AnyFn>>, BaseRouter<AnyFn> | null];
type State = [routesTree: RouteTree, cbs: AnyMiddlewareFn[], errs: ErrorHandlerData[], allErrFn: ErrorHandlerData[1]];

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

export const build = (router: AnyRouter, state: State, prefix: string, errSet: ErrorSet): void => {
  let copied = false;

  // Only change middleware when necessary
  if (router.m.length !== 0) {
    copied = true;
    state = state.with(1, [...state[1], ...router.m]) as State;
  }

  // Only change error set when necessary
  if (router.e.length !== 0) {
    if (!copied) {
      state = state.with(2, state[2]) as State;
      copied = true;
    }

    errSet = new Map(state[2] = [...state[2], ...router.e]);
  }

  // Set new fallback error handler
  if (router.f !== null) {
    if (copied)
      state[3] = router.f;
    else
      state = state.with(3, router.f) as State;
  }

  for (
    let i = 0,
      // Current route
      x: HandlerData,
      routes = router.r,

      // Route tree
      tree = state[0],

      // Middleware
      mds = state[1],
      mdsLen = mds.length,

      // Fallback error callback
      errFallback = state[3];

    i < routes.length;
    i++
  ) {
    x = routes[i];

    const f = x[2];
    insertItem(
      x[0] === null
        ? tree[1] ??= createRouter()
        : tree[0][x[0]] ??= createRouter(),

      joinPath(prefix, x[1]),
      mds.length === 0
        ? f
        : x[3]
          ? (p: string[], c: Context) => {
            let idx = 0;
            const next = (e?: any): any => typeof e === 'undefined'
              ? idx < mdsLen
                ? mds[idx++](next, c)
                : f(p, c)
              : handleErrors(errSet, errFallback, e, c);
            return next();
          }
          : (c: Context) => {
            let idx = 0;
            const next = (e?: any): any => typeof e === 'undefined'
              ? idx < mdsLen
                ? mds[idx++](next, c)
                // @ts-expect-error Only one argument here
                : f(c)
              : handleErrors(errSet, errFallback, e, c);
            return next();
          }
    );
  }

  for (let i = 0, x: SubrouterData, routes = router.s; i < routes.length; i++) {
    x = routes[i];
    build(x[1], state, x[0] === '/' ? prefix : prefix + x[0], errSet);
  }
};

/**
 * Build to the fastest handler
 */
export default ((router, adapter) => {
  // This doesn't work with Cloudflare if you put it in the global scope
  const nf = new Response(null, { status: 404 });
  const badReq = new Response(null, { status: 400 });

  const routes: RouteTree = [ {}, null];
  build(router, [routes, [], [], () => badReq], '', new Map());

  // Fallback method
  const fallback = routes[1] == null
    ? () => nf
    : createMatcher(routes[1], () => nf);

  // Build for registered methods
  const routeMap = new Map(Object.entries(routes[0])
    .map((pair) => [pair[0], createMatcher(pair[1], fallback)]));

  return adapter == null
    // No adapter provided
    ? (r) => {
      const u = r.url;
      const s = u.indexOf('/', 12) + 1;
      const e = u.indexOf('?', s);

      const c: Context = Object.create(context);
      c.headers = [];
      c.req = r;

      return (routeMap.get(r.method) ?? fallback)(e === -1 ? u.slice(s) : u.substring(s, e), c);
    }
    // Custom adapter
    : (r, ...a: any[]) => {
      const u = r.url;
      const s = u.indexOf('/', 12) + 1;
      const e = u.indexOf('?', s);

      return (routeMap.get(r.method) ?? fallback)(e === -1 ? u.slice(s) : u.substring(s, e), adapter(r, ...a as any));
    };
}) as BuildFn;

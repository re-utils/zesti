import match from '@mapl/router/quick-match';

import type { AnyFn } from '../types/utils';
import type { BuildFn } from './types';
import type { AnyMiddlewareFn, AnyRouter, SubrouterData } from '..';
import type { Context, HandlerData } from '../types/route';
import type { ErrorHandlerData } from '../error';

import context from './context';
import { handleErrors, type ErrorSet } from './utils';

type BaseRouter = [staticRoutes: string[], val: AnyFn[], dynamicRoutes: string[], val: AnyFn[]];
type RouteTree = [Record<string, BaseRouter>, BaseRouter | null];
type State = [routesTree: RouteTree, cbs: AnyMiddlewareFn[], errs: ErrorHandlerData[], allErrFn: ErrorHandlerData[1]];

/**
 * Create a matcher
 */
export const createMatcher = (router: BaseRouter, nf: (...args: any[]) => Response): (p: string, r: Context) => any => {
  const [staticList, staticVal, dynList, dynVal] = router;

  return (p: string, c: Context) => {
    let i = staticList.indexOf(p);
    if (i !== -1) return staticVal[i](c);

    let tmp: string[] | null;
    for (i = 0; i < dynList.length; i++) {
      tmp = match(dynList[i], p);
      if (tmp !== null)
        return dynVal[i](tmp, c);
    }

    return nf(p, c);
  };
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
      tmp: 0 | 2,

      // Current route
      x: HandlerData,
      routes = router.r,
      targetRouter: BaseRouter,

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

    // Decide the router to push in
    targetRouter = x[0] === null
      ? tree[1] ??= [[], [], [], []]
      : tree[0][x[0]] ??= [[], [], [], []];

    // Decide the store to push in
    tmp = x[3] ? 2 : 0;

    // Push the path and the handler
    targetRouter[tmp].push(prefix + x[1]);

    (targetRouter[tmp + 1] as AnyFn[]).push((...args: [any, any]) => {
      let idx = 0;
      const c: Context = args[args.length - 1];

      const next = (e?: any): any => typeof e === 'undefined'
        ? idx < mdsLen
          ? mds[idx++](next, c)
          : f(...args)
        : handleErrors(errSet, errFallback, e, c);
      return next();
    });
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

  const routes: RouteTree = [ {}, null];
  build(router, [routes, [], [], () => new Response(null, { status: 400 })], '', new Map());

  // Fallback method
  const fallback = routes[1] === null
    ? () => nf
    : createMatcher(routes[1], () => nf);

  // Build for registered methods
  const routeMap = new Map(Object.entries(routes[0])
    .map((pair) => [pair[0], createMatcher(pair[1], fallback)]));

  return adapter == null
    // No adapter provided
    ? (r) => {
      const c: Context = Object.create(context);
      c.headers = [];
      c.req = r;

      return (routeMap.get(r.method) ?? fallback)(new URL(r.url).pathname, c);
    }
    // Custom adapter
    : (r, ...a: any[]) => (routeMap.get(r.method) ?? fallback)(new URL(r.url).pathname, adapter(r, ...a as any));
}) as BuildFn;

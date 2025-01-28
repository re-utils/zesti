import { createRouter, insertItem, type Router as BaseRouter } from '@mapl/router';

import type { AnyFn } from '../../types/utils';
import type { BuildFn } from '../types';
import type { AnyMiddlewareFn, AnyRouter, SubrouterData } from '../..';
import type { Context, HandlerData } from '../../types/route';
import type { AnyErrorValue, ErrorHandlerData } from '../../error';

import { matcher } from './route';
import context from '../context';

type RouteTree = [Record<string, BaseRouter<AnyFn>>, BaseRouter<AnyFn> | null];
type ErrorSet = Map<symbol, ErrorHandlerData[1]>;

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

export type State = [routesTree: RouteTree, cbs: AnyMiddlewareFn[], errs: ErrorHandlerData[], allErrFn: ErrorHandlerData[1]];

const build = (router: AnyRouter, state: State, prefix: string, errSet: ErrorSet): void => {
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
      // @ts-expect-error Hey
      x[0] === null
        // @ts-expect-error Hey
        ? tree[1] ??= createRouter()
        // @ts-expect-error Hey
        : tree[0][x[0]] ??= createRouter(),

      prefix + x[1],
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

      const c: Context = Object.create(context);
      c.headers = [];
      c.req = r;

      return (routeMap.get(r.method) ?? fallback)(e === -1 ? u.slice(s) : u.substring(s, e), c);
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

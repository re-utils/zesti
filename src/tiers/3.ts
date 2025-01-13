/* eslint-disable */
import type { AnyRouter, MiddlewareData, MiddlewareFn } from '..';
import type { AnyHandler, Context, HandlerData } from '../types/route';
import type { AnyFn } from '../types/utils';

import { createRouter, insertItem, type Router as BaseRouter } from '@mapl/router';

import { isAsync } from '../utils';
import { isException, type Exception } from '../except';
import toHandler from './utils/toHandler';
import { badReq, errMatcher, matcher, notFound } from './utils/route';

type RouteTree = [Record<string, BaseRouter<AnyFn>>, BaseRouter<AnyFn> | null];
type CallbackList = [isAsync: boolean, ((...args: any[]) => any), attach: string | null][];

const build = (router: AnyRouter, errList: [err: number, handler: AnyHandler][], routes: RouteTree, cbs: CallbackList, prefix: string, isScopeAsync: boolean): void => {
  /** Middleware built */
  const mds = [...cbs];

  for (
    let i = 0,
      x: MiddlewareData,
      f: MiddlewareFn<any>,
      asyncFn: boolean,
      headers: [string, string][] | [string, string];
    i < router.m.length;
    i++
  ) {
    x = router.m[i];

    if (x[0] === 2) {
      headers = x[1];

      mds.push([
        false,
        headers.length === 1 ?
          (headers = headers[0], (c: Context) => {
            c.headers.push(headers as [string, string]);
          })
          : (c: Context) => {
            c.headers.push(...headers as [string, string][]);
          },
        null
      ]);
    } else {
      f = x[1];
      asyncFn = isAsync(f);
      isScopeAsync ||= asyncFn;
      mds.push([asyncFn, f, x[2]]);
    }
  }

  // Error handling
  const errs = Object.fromEntries(errList.concat(router.e).map((pair) => [pair[0], toHandler(pair[1], isScopeAsync, false)]));
  errs[0] ??= badReq;
  const errF = errMatcher(errs);

  // Load routes
  for (let i = 0, x: HandlerData, hasParam: boolean; i < router.r.length; i++) {
    /** The target function to run */
    x = router.r[i];
    const f = toHandler(x[2], isScopeAsync, hasParam = x[1].includes('*'));

    insertItem(
      // @ts-expect-error Hey
      x[0] === null
        // @ts-expect-error Hey
        ? routes[1] ??= createRouter()
        // @ts-expect-error Hey
        : routes[0][x[0]] ??= createRouter(),
      prefix + x[1],

      mds.length === 0
        ? f
        : isScopeAsync
        // No async
          ? hasParam
            ? async (p: string[], c: Context, ...a: any[]) => {
              for (let j = 0, t: CallbackList[number], r: any; j < mds.length; j++) {
                t = mds[j];

                r = t[0] ? await t[1](c, ...a) : t[1](c, ...a);
                if (isException(r)) return errF(c, r);

                if (t[2] !== null)
                  // @ts-expect-error Hey
                  c[t[2]] = r;
              }

              return f(p, c, ...a);
            }
            : async (c: Context, ...a: any[]) => {
              for (let j = 0, t: CallbackList[number], r: any; j < mds.length; j++) {
                t = mds[j];
                r = t[0] ? await t[1](c, ...a) : t[1](c, ...a);
                if (isException(r)) return errF(c, r);

                if (t[2] !== null)
                  // @ts-expect-error Hey
                  c[t[2]] = r;
              }

              return f(c, ...a);
            }

          // No async
          : hasParam
            ? (p: string[], c: Context, ...a: any[]) => {
              for (let j = 0, t: CallbackList[number], r: any; j < mds.length; j++) {
                t = mds[j];
                r = t[1](c, ...a);
                if (isException(r)) return errF(c, r);

                if (t[2] !== null)
                  // @ts-expect-error Hey
                  c[t[2]] = r;
              }

              return f(p, c, ...a);
            }
            : (c: Context, ...a: any[]) => {
              for (let j = 0, t: CallbackList[number], r: any; j < mds.length; j++) {
                t = mds[j];
                r = t[1](c, ...a);
                if (isException(r)) return errF(c, r);

                if (t[2] !== null)
                  // @ts-expect-error Hey
                  c[t[2]] = r;
              }

              return f(c, ...a);
            }
    );
  }

  // Build subrouters
  for (let i = 0, x: [string, AnyRouter]; i < router.s.length; i++) {
    x = router.s[i];
    if (x[0].includes('*'))
      throw new Error('Subrouter path cannot be dynamic');

    build(x[1], errList, routes, mds, x[0] === '/'
      ? prefix
      : prefix + x[0], isScopeAsync);
  }
};

export default (router: AnyRouter): (req: Request) => Response | Promise<Response> => {
  const routes: RouteTree = [ {}, null];
  build(router, [], routes, [], '', false);

  const routeMap = Object.fromEntries(Object.entries(routes[0])
    .map((pair) => [pair[0], matcher(pair[1])])
  );
  const fallback = routes[1] === null
    ? null
    : matcher(routes[1]);

  return (r: Request, ...a: any[]): Response | Promise<Response> => {
    const tmp: typeof fallback = routeMap[r.method] ?? fallback;
    if (tmp === null) return notFound();

    const u = r.url;
    const s = u.indexOf('/', 12) + 1;
    const e = u.indexOf('?') >>> 0;

    return tmp(u.substring(s, e), {
      status: 200,
      req: r,
      headers: [],
      pathStart: s,
      pathEnd: e
    }, ...a);
  };
};

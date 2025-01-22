import type { Handler, HandlerData, Context } from './types/route';
import type { MaybePromise } from './types/utils';

// Types
export type Methods = typeof methods[number];

export type InferParams<Path extends string> = Path extends `${string}*${infer Rest}`
  ? Rest extends '*' ? [string] : [string, ...InferParams<Rest>]
  : [];

export type RouteRegister<
  Method extends string | null,
  State extends AnyState,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][]
> = <
  const Path extends string,
  const T extends (InferParams<Path>['length'] extends 0
    ? Handler<State>
    : Handler<State, [InferParams<Path>]>
  )
>(path: Path, handler: T) => Router<
  State,
  [...Routes, [Method, Path, T, InferParams<Path>['length'] extends 0 ? false : true]],
  SubRouters
>;

export type Router<
  State extends AnyState = {},
  Routes extends HandlerData[] = [],
  SubRouters extends [string, AnyRouter][] = []
> = { [Method in Methods]: RouteRegister<Uppercase<Method>, State, Routes, SubRouters> }
  & {
    // Weird stuff
    any: RouteRegister<null, State, Routes, SubRouters>,

    // Custom stuff
    insert: <
      const Method extends string,
      const Path extends string,
      const T extends InferParams<Path>['length'] extends 0
        ? Handler<State>
        : Handler<State, [InferParams<Path>]>
    >(method: Method, path: Path, handler: T) => Router<
      State,
      [...Routes, [Method, Path, T, InferParams<Path>['length'] extends 0 ? false : true]],
      SubRouters
    >,

    /**
     * Register a subrouter
     */
    route: <const Path extends string, const SubRouter extends AnyRouter>(path: string, subrouter: SubRouter) => Router<
      State, Routes, [...SubRouters, [Path, SubRouter]]
    >,

    /**
     * Register a function that validate every request
     */
    use: (fn: MiddlewareFn<State>) => Router<State, Routes, SubRouters>,

    /**
     * Add response headers
     */
    headers: (headers: HeadersInit) => Router<State, Routes, SubRouters>,

    /**
     * All routes
     */
    r: Routes,

    /**
     * All subroutes
     */
    s: SubRouters,

    /**
     * All middlewares
     */
    m: AnyMiddlewareFn[]
  };

export type AnyState = Record<string, any>;
export type AnyRouter = Router<AnyState, any[], any[]>;

export type MiddlewareFn<State extends AnyState> = (...args: [
  next: () => MaybePromise<Response>, Context & State
]) => MaybePromise<Response>;
export type AnyMiddlewareFn = MiddlewareFn<AnyState>;

// Implementation
const initRoute = (method: string | null) => function (this: AnyRouter, path: string, b: any): any {
  this.r.push([method, path, b, path.includes('*')]);
  return this;
};

const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;
const registers: Router = {
  // Load routes
  ...Object.fromEntries(methods.map((m) => [m, initRoute(m.toUpperCase())])),

  any: initRoute(null),
  insert(this: AnyRouter, method: string, path: string, b: any) {
    this.r.push([method, path, b, path.includes('*')]);
    return this;
  },

  use(this: AnyRouter, ...fns: AnyMiddlewareFn[]) {
    this.m.push(...fns);
    return this;
  },

  headers(this: AnyRouter, headers: any) {
    if (!Array.isArray(headers)) {
      headers = headers instanceof Headers
        ? headers.entries().toArray()
        : Object.entries(headers);
    }

    this.m.push(async (next, c) => {
      c.headers.push(...headers);
      return next();
    });

    return this;
  },

  route(this: AnyRouter, ...args: [string, any]) {
    if (args[0].includes('*'))
      throw new Error('Subrouter path cannot be dynamic');

    this.s.push(args as never);
    return this;
  }
} as any;

export default (): Router => ({
  ...registers,
  r: [],
  m: [],
  s: []
});

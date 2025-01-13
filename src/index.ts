import type { DynamicException, ExcludeExceptionType, StaticException } from './except';
import type { Handler, HandlerData, AnyHandler, Context } from './types/route';

// Types
export type Methods = typeof methods[number];

export type InferParams<Path extends string> = Path extends `${string}*${infer Rest}`
  ? Rest extends '*' ? [string] : [string, ...InferParams<Rest>]
  : [];

export type RouteRegister<
  Method extends string | null,
  Args extends any[],
  State extends AnyState,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][]
> = <
  const Path extends string,
  const T extends (InferParams<Path>['length'] extends 0
    ? Handler<State, Args>
    : Handler<State, Args, [InferParams<Path>]>
  )
>(path: Path, handler: T) => Router<
  Args,
  State,
  [...Routes, [Method, Path, T]],
  SubRouters
>;

export type Router<
  Args extends any[] = [],
  State extends AnyState = {},
  Routes extends HandlerData[] = [],
  SubRouters extends [string, AnyRouter][] = []
> = { [Method in Methods]: RouteRegister<Uppercase<Method>, Args, State, Routes, SubRouters> }
  & {
    // Weird stuff
    any: RouteRegister<null, Args, State, Routes, SubRouters>,

    // Custom stuff
    insert: <const Method extends string, const Path extends string, const T extends Handler<State, Args>>(method: Method, path: Path, handler: T) => Router<
      Args,
      State,
      [...Routes, [Method, Path, T]],
      SubRouters
    >
  }
  & {
    /**
     * Handle a static exception
     */
    catch: (<const T extends Handler<{}>>(exception: StaticException, handler: T) => Router<
      Args, State, Routes, SubRouters
    >) & (<const Payload, const T extends Handler<{}, [Payload]>>(exception: DynamicException<Payload>, handler: T) => Router<
      Args, State, Routes, SubRouters
    >),

    /**
     * Handle all exceptions
     */
    catchAll: <const T extends Handler<{}>>(handler: T) => Router<Args, State, Routes, SubRouters>,

    /**
     * Register a subrouter
     */
    route: <const Path extends string, const SubRouter extends AnyRouter>(path: string, subrouter: SubRouter) => Router<
      Args, State, Routes, [...SubRouters, [Path, SubRouter]]
    >,

    /**
     * Register a function to parse and set the result to the context
     */
    parse: <const Prop extends string, const ParserReturn>(prop: Prop, fn: (ctx: Context & State) => ParserReturn) => Router<
      Args, State & Record<Prop, ExcludeExceptionType<Awaited<ParserReturn>>>, Routes, SubRouters
    >,

    /**
     * Register a function that validate every request
     */
    validate: (fn: MiddlewareFn<State>) => Router<Args, State, Routes, SubRouters>,

    /**
     * Add response headers
     */
    headers: (headers: HeadersInit) => Router<Args, State, Routes, SubRouters>,

    /**
     * All routes
     */
    r: Routes,
    /**
     * All middlewares
     */
    m: MiddlewareData[],
    /**
     * All subroutes
     */
    s: SubRouters,
    // 0 is for all except routes
    e: [err: number, handler: AnyHandler][]
  };

export type AnyRouter = Router<any[], any, any[], any[]>;
export type AnyState = Record<string, any>;

export type MiddlewareFn<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => unknown;
export type MiddlewareData =
  // Parser and validator (require exception validation)
  | [0, MiddlewareFn<any>, string]
  | [1, MiddlewareFn<any>, null]
  // Headers
  | [2, [string, string][]];

// Implementation
const initRoute = (method: string | null) => function (this: AnyRouter, a: any, b: any): any {
  this.r.push([method, a, b]);
  return this;
};

const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;
const registers: Router = {
  // Load routes
  ...Object.fromEntries(methods.map((m) => [m, initRoute(m.toUpperCase())])),

  // Load middleware
  parse(this: AnyRouter, prop: string, fn: any) {
    this.m.push([0, fn, prop]);
    return this;
  },

  validate(this: AnyRouter, fn: any) {
    this.m.push([1, fn, null]);
  },

  headers(this: AnyRouter, headers: HeadersInit) {
    this.m.push([
      2, Array.isArray(headers)
        ? headers
        : headers instanceof Headers
          ? headers.entries().toArray()
          : Object.entries(headers)
    ]);
  },

  insert(this: AnyRouter, ...args: [any, any, any]) {
    this.r.push(args);
    return this;
  },
  any: initRoute(null),

  catch(this: AnyRouter, e: StaticException | DynamicException<any>, a: any) {
    // @ts-expect-error Don't need to pass a payload
    this.e.push([(Array.isArray(e) ? e : e())[1], a]);
    return this;
  },
  catchAll(this: AnyRouter, a: any) {
    this.e.push([0, a]);
    return this;
  },

  route(this: AnyRouter, ...args: [any, any]) {
    this.s.push(args as never);
    return this;
  }
} as any;

export default (): Router => ({
  ...registers,
  r: [],
  m: [],
  s: [],
  e: []
});

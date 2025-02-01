import type { AnyError, DynamicError, DynamicErrorHandler, ErrorHandlerData, StaticError } from './error';
import type { Handler, HandlerData, Context } from './types/route';
import type { AwaitedReturn, MaybePromise } from './types/utils';

// Types
export type Methods = typeof methods[number];

export type InferParams<Path extends string> = Path extends `${string}*${infer Rest}`
  ? Rest extends '*' ? [string] : [string, ...InferParams<Rest>]
  : [];

export type SubrouterData = [string, AnyRouter];

export type RouteRegister<
  Method extends string | null,
  State extends AnyState,
  Routes extends HandlerData[],
  SubRouters extends SubrouterData[],
  ErrorResponse extends Response
> = <
  const Path extends string,
  const T extends (InferParams<Path>['length'] extends 0
    ? Handler<State>
    : Handler<State, [InferParams<Path>]>
  )
>(path: Path, handler: T) => Router<
  State,
  [...Routes, [Method, Path, T, InferParams<Path>['length'] extends 0 ? false : true]],
  SubRouters,
  ErrorResponse
>;

export type Router<
  State extends AnyState = {},
  Routes extends HandlerData[] = [],
  SubRouters extends SubrouterData[] = [],
  ErrorResponse extends Response = never
> = { [Method in Methods]: RouteRegister<Uppercase<Method>, State, Routes, SubRouters, ErrorResponse> }
  & {
    /**
     * Type of the current state
     */
    stateType: State,

    /**
     * Return type of error handlers
     */
    errorType: ErrorResponse,

    // Weird stuff
    any: RouteRegister<null, State, Routes, SubRouters, ErrorResponse>,

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
      SubRouters,
      ErrorResponse
    >,

    /**
     * Register a subrouter
     */
    route: <const Path extends string, const SubRouter extends AnyRouter>(path: string, subrouter: SubRouter) => Router<
      State, Routes, [...SubRouters, [Path, SubRouter]], ErrorResponse
    >,

    /**
     * Register a function that validate every request
     */
    use: <Set extends AnyState = {}>(fn: MiddlewareFn<Set & State>) => Router<State & Set, Routes, SubRouters, ErrorResponse>,

    /**
     * Register an error handler
     */
    catch:
      // Static error
      (<const Fn extends Handler<State>>(err: StaticError, fn: Fn) => Router<State, Routes, SubRouters, ErrorResponse | Extract<AwaitedReturn<Fn>, Response>>)
      // Dynamic error
      | (<const T, const Fn extends DynamicErrorHandler<T>>(err: DynamicError<T>, fn: Fn) => Router<State, Routes, SubRouters, ErrorResponse | Extract<AwaitedReturn<Fn>, Response>>),

    /**
     * Handles all error
     */
    catchAll: <const Fn extends Handler<State>>(fn: Fn) => Router<State, Routes, SubRouters, ErrorResponse | Extract<AwaitedReturn<Fn>, Response>>,

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
    m: AnyMiddlewareFn[],

    /**
     * All error handlers
     */
    e: ErrorHandlerData[],

    /**
     * Fallback error handler
     */
    f: ErrorHandlerData[1] | null
  };

export type AnyState = Record<string, any>;
export type AnyRouter = Router<AnyState, HandlerData[], SubrouterData[], any>;

export type MiddlewareFn<State extends AnyState = {}> = (...args: [
  next: () => MaybePromise<Response>, Context & State
]) => MaybePromise<Response>;
export type AnyMiddlewareFn = MiddlewareFn<AnyState>;

export const fn = <Set extends AnyState = {}>(f: MiddlewareFn<Set>): MiddlewareFn<Set> => f as any;

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

  route(this: AnyRouter, ...args: [string, any]) {
    if (args[0].includes('*'))
      throw new Error('Subrouter path cannot be dynamic');

    this.s.push(args as never);
    return this;
  },

  catch(this: AnyRouter, err: AnyError, f: any) {
    this.e.push([Array.isArray(err) ? err[0] : err.i, f]);
    return this;
  },

  catchAll(this: AnyRouter, f: any) {
    this.f = f;
    return this;
  },

  r: null,
  m: null,
  s: null,
  e: null,
  f: null
} as any;

export default (): Router => {
  const o = Object.create(registers);
  // eslint-disable-next-line
  o.r = [];
  // eslint-disable-next-line
  o.m = [];
  // eslint-disable-next-line
  o.s = [];
  // eslint-disable-next-line
  o.e = [];
  return o;
};

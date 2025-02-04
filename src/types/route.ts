import type { AwaitedReturn, ConcatPath, MaybePromise } from './utils.js';

export interface TextResponse<T, S extends number> extends Response {
  text: () => Promise<T extends string ? T : T extends null ? '' : string>;
  status: S extends -1 ? number : S;
}

export interface JSONResponse<T, S extends number> extends Response {
  json: () => Promise<T extends string ? `"${T}"` : T>;
  status: S extends -1 ? number : S;
}

export interface Context {
  req: Request;

  headers: [string, string][];

  status: number;
  statusText?: string;

  send: <T extends BodyInit | null, S extends number = -1>(body: T, status?: S) => TextResponse<T, S>;
  json: <T extends {}, S extends number = -1>(body: T, status?: S) => JSONResponse<T, S>;
  html: Context['send'];
}

export type Handler<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => MaybePromise<Response | null | undefined>;
export type AnyHandler = Handler<any, [any]> | Handler<any>;

// null is for any handler
export type HandlerData = [method: string | null, path: string, fn: AnyHandler, hasParam: boolean];

// Client API
export type InferHandlerRequestInit<T extends HandlerData, State> = State & (T[3] extends true
  ? { params: [string | number, ...(string | number)[]] }
  : {}
  );

export type InferHandlerRPC<T extends HandlerData, State, ErrorResponse extends Response, Prefix extends string> = Record<
  null extends T[0] ? '$' : Lowercase<T[0] & {}>,
  keyof InferHandlerRequestInit<T, State> extends never
    ? (path: ConcatPath<Prefix, T[1]>, init?: RequestInit) => Promise<AwaitedReturn<T[2]> | ErrorResponse>
    : (path: ConcatPath<Prefix, T[1]>, init: InferHandlerRequestInit<T, State> & RequestInit) => Promise<AwaitedReturn<T[2]> | ErrorResponse>
>;

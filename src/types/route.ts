import type { AwaitedReturn, ConcatPath, LastItem, MaybePromise, PickIfExists } from './utils.js';

export interface TypedResponse<T, S extends number> extends Response {
  text: () => Promise<T extends string ? T : T extends null ? '' : string>;
  json: () => Promise<T extends string ? `"${T}"` : T>;
  status: S extends -1 ? number : S;
}

export type ResponseFn<Input> = <T extends Input, S extends number = -1>(body: T, status?: S) => TypedResponse<T, S>;

export interface Context {
  req: Request;

  headers: [string, string][];

  status: number;
  statusText?: string;

  send: ResponseFn<BodyInit | null>;
  json: ResponseFn<{}>;
  html: Context['send'];
}

export type Handler<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => MaybePromise<Response | null | undefined>;
export type AnyHandler = Handler<any, [any]> | Handler<any>;

// null is for any handler
export type HandlerData = [method: string | null, path: string, fn: AnyHandler, hasParam: boolean];

// Client API
export type InferHandlerRequestInit<T extends AnyHandler, Path extends string> =
  PickIfExists<Exclude<LastItem<Parameters<T>>, keyof Context>, 'body' | 'query'>
  & (Path extends `${string}*${string}`
    ? { params: [string | number, ...(string | number)[]] }
    : {}
  );

export type InferHandlerRPC<T extends HandlerData, ErrorResponse extends Response, Prefix extends string> = Record<
  null extends T[0] ? '$' : Lowercase<T[0] & {}>,
  keyof InferHandlerRequestInit<T[2], T[1]> extends never
    ? (path: ConcatPath<Prefix, T[1]>, init?: RequestInit) => Promise<AwaitedReturn<T[2]> | ErrorResponse>
    : (path: ConcatPath<Prefix, T[1]>, init: InferHandlerRequestInit<T[2], T[1]> & RequestInit) => Promise<AwaitedReturn<T[2]> | ErrorResponse>
>;

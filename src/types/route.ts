import type { InferParams } from '../index.js';
import type { AwaitedReturn, ConcatPath, MaybePromise, PickIfExists } from './utils.js';

export interface Context {
  req: Request;

  headers: (readonly [string, string])[];

  status: number;
  statusText?: string;
}

export interface BufferHandler<State, Args extends any[] = []> {
  type: 'buffer';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit | null>;
}

export type PlainHandler<State, Args extends any[] = []> = BufferHandler<State, Args>['fn'];

export interface TextHandler<State, Args extends any[] = []> {
  type: 'text';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit | null>;
}

export interface JSONHandler<State, Args extends any[] = []> {
  type: 'json';
  fn: (...args: [...Args, Context & State]) => any;
}

export interface HTMLHandler<State, Args extends any[] = []> {
  type: 'html';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit | null>;
}

export interface ResponseHandler<State, Args extends any[] = []> {
  type: 'plain';
  fn: (...args: [...Args, Context & State]) => MaybePromise<Response | null | undefined>;
}

export type TypedHandler<State, Args extends any[] = []> =
  BufferHandler<State, Args> |
  TextHandler<State, Args> |
  JSONHandler<State, Args> |
  HTMLHandler<State, Args> |
  ResponseHandler<State, Args>;

export type AnyTypedHandler = TypedHandler<Record<string, any>> | TypedHandler<Record<string, any>, [any]>;

export type Handler<
  State,
  Args extends any[] = []
> = PlainHandler<State, Args> | TypedHandler<State, Args>;
export type AnyHandler = Handler<any, [any]> | Handler<any>;

// null is for any handler
export type HandlerData = [method: string | null, path: string, fn: AnyHandler, hasParam: boolean];

export interface TypedResponse<T> extends Response {
  text: () => Promise<T extends string ? T : string>;
  json: () => Promise<T extends string | number | bigint | boolean | symbol | undefined | null ? never : T>;
}

// Client API
export type InferTypedHandlerResponse<T extends AnyTypedHandler> = T['type'] extends 'buffer' | 'text' | 'html' | 'json'
  ? TypedResponse<AwaitedReturn<T['fn']>>
  : T['type'] extends 'plain'
    ? AwaitedReturn<T['fn']>
    : unknown;

export type InferHandlerRequestInit<T, Path extends string> =
  (T extends Handler<infer State, any>
    ? PickIfExists<State, 'body' | 'query'>
    : {}
  ) & (InferParams<Path>['length'] extends 0
    ? {}
    : { params: InferParams<Path> });

export type InferHandlerResponse<T extends AnyHandler> = T extends AnyTypedHandler
  ? InferTypedHandlerResponse<T>
  : TypedResponse<AwaitedReturn<T>>;

export type InferHandlerRPC<T extends HandlerData, Prefix extends string> = Record<
  null extends T[0] ? '$' : T[0] & {},
  keyof InferHandlerRequestInit<T[2], T[1]> extends never
    ? (path: ConcatPath<Prefix, T[1]>, init?: RequestInit) => InferHandlerResponse<T[2]>
    : (path: ConcatPath<Prefix, T[1]>, init?: InferHandlerRequestInit<T[2], T[1]> & RequestInit) => InferHandlerResponse<T[2]>
>;

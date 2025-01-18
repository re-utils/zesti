import type { MaybePromise } from './utils.js';

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

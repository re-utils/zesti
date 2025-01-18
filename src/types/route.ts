import type { MaybePromise } from './utils.js';

export interface Context {
  req: Request;

  headers: (readonly [string, string])[];

  status: number;
  statusText?: string;
}

export interface BufferHandler<State, AfterArgs extends any[], Args extends any[] = []> {
  type: 'buffer';
  fn: (...args: [...Args, Context & State, ...AfterArgs]) => MaybePromise<BodyInit | null>;
}

export type PlainHandler<State, AfterArgs extends any[], Args extends any[] = []> = BufferHandler<State, Args, AfterArgs>['fn'];

export interface TextHandler<State, AfterArgs extends any[], Args extends any[] = []> {
  type: 'text';
  fn: (...args: [...Args, Context & State, ...AfterArgs]) => MaybePromise<BodyInit | null>;
}

export interface JSONHandler<State, AfterArgs extends any[], Args extends any[] = []> {
  type: 'json';
  fn: (...args: [...Args, Context & State, ...AfterArgs]) => any;
}

export interface HTMLHandler<State, AfterArgs extends any[], Args extends any[] = []> {
  type: 'html';
  fn: (...args: [...Args, Context & State, ...AfterArgs]) => MaybePromise<BodyInit | null>;
}

export interface ResponseHandler<State, AfterArgs extends any[], Args extends any[] = []> {
  type: 'plain';
  fn: (...args: [...Args, Context & State, ...AfterArgs]) => MaybePromise<Response | null | undefined>;
}

export type TypedHandler<State, AfterArgs extends any[] = [], Args extends any[] = []> =
  BufferHandler<State, Args, AfterArgs> |
  TextHandler<State, Args, AfterArgs> |
  JSONHandler<State, Args, AfterArgs> |
  HTMLHandler<State, Args, AfterArgs> |
  ResponseHandler<State, Args, AfterArgs>;

export type AnyTypedHandler = TypedHandler<Record<string, any>, [], any[]> | TypedHandler<Record<string, any>, [any], any[]>;

export type Handler<
  State,
  AfterArgs extends any[] = [],
  Args extends any[] = []
> = PlainHandler<State, Args, AfterArgs> | TypedHandler<State, Args, AfterArgs>;
export type AnyHandler = Handler<Record<string, any>, any[], any[]>;

// null is for any handler
export type HandlerData = [method: string | null, path: string, fn: AnyHandler, hasParam: boolean];

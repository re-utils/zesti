import type { AnyRouter, SubrouterData } from '..';
import type { HandlerData } from '../types/route';
import type { AwaitedReturn, ConcatPath, PickIfExists, UnionToIntersection } from '../types/utils';

// Client API
export type InferHandlerRequestInit<T extends HandlerData, State> = State & (T[3] extends true
  ? { params: [string | number, ...(string | number)[]] }
  : {}
  );

export type ExcludedRequestInit = Omit<RequestInit, 'body' | 'query'>;

export type InferHandlerRPC<T extends HandlerData, State, ErrorResponse extends Response, Prefix extends string> = Record<
  null extends T[0] ? '$' : Lowercase<T[0] & {}>,
  keyof InferHandlerRequestInit<T, State> extends never
    ? (path: ConcatPath<Prefix, T[1]>, init?: RequestInit) => Promise<AwaitedReturn<T[2]> | ErrorResponse>
    : (path: ConcatPath<Prefix, T[1]>, init: ExcludedRequestInit & InferHandlerRequestInit<T, State>) => Promise<AwaitedReturn<T[2]> | ErrorResponse>
>;

export type InferClient<
  T extends AnyRouter,
  ErrorResponse extends Response,
  Prefix extends string
> = InferRoutes<
  T['r'],

  // Pick right away
  PickIfExists<T['stateType'], 'body' | 'query'>,

  T['errorType'] | ErrorResponse,
  Prefix
> | InferSubrouters<T['s'], T['errorType'] | ErrorResponse, Prefix>;

export type InferSubrouters<T extends SubrouterData[], ErrorResponse extends Response, Prefix extends string> = T extends [infer A extends SubrouterData, ...infer Rest extends SubrouterData[]]
  ? InferClient<A[1], ErrorResponse, ConcatPath<Prefix, A[0]>> | InferSubrouters<Rest, ErrorResponse, Prefix>
  : never;

export type InferRoutes<T extends HandlerData[], State, ErrorResponse extends Response, Prefix extends string> = T extends [infer A extends HandlerData, ...infer Rest extends HandlerData[]]
  ? InferHandlerRPC<A, State, ErrorResponse, Prefix> | InferRoutes<Rest, State, ErrorResponse, Prefix>
  : never;

export type Client<T extends AnyRouter> = UnionToIntersection<InferClient<T, never, ''>>;

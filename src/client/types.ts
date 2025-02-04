import type { AnyRouter, SubrouterData } from '..';
import type { HandlerData, InferHandlerRPC } from '../types/route';
import type { ConcatPath, PickIfExists, UnionToIntersection } from '../types/utils';

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

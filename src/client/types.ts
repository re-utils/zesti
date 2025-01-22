import type { AnyRouter, SubrouterData } from '..';
import type { HandlerData, InferHandlerRPC } from '../types/route';
import type { ConcatPath, UnionToIntersection } from '../types/utils';

export type InferClient<T extends AnyRouter, Prefix extends string> = InferRoutes<T['r'], Prefix> | InferSubrouters<T['s'], Prefix>;

export type InferSubrouters<T extends SubrouterData[], Prefix extends string = ''> = T extends [infer A extends SubrouterData, ...infer Rest extends SubrouterData[]]
  ? InferClient<A[1], ConcatPath<Prefix, A[0]>> | InferSubrouters<Rest, Prefix>
  : never;

export type InferRoutes<T extends HandlerData[], Prefix extends string> = T extends [infer A extends HandlerData, ...infer Rest extends HandlerData[]]
  ? InferHandlerRPC<A, Prefix> | InferRoutes<Rest, Prefix>
  : never;

export type Client<T extends AnyRouter> = UnionToIntersection<InferClient<T, ''>>;

import type { AnyRouter, AnyState } from '..';
import type { Context } from '../types/route';
import type { MaybePromise } from '../types/utils';

export type BuildAdapter<State extends AnyState, Args extends any[] = []> = (r: Request, ...args: Args) => Context & State;

export type FetchFn<Args extends any[] = any[]> = (req: Request, ...args: Args) => MaybePromise<Response>;
export type BuildFn = <Args extends any[]>(router: AnyRouter, adapter?: BuildAdapter<any, Args>) => FetchFn<Args>;

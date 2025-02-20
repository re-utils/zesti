/// <reference types="@cloudflare/workers-types" />
import router, { type Router } from '..';

import type { BuildAdapter, BuildFn, FetchFn } from '../build/types';
import type { Context } from '../types/route';

import context from '../build/context';

export interface InitState {
  // @ts-expect-error User should provide the type
  env: Env;
  ctx: ExecutionContext;
}
export interface BaseContext extends Context, InitState { }

export default router as () => Router<InitState>;

type FetchArgs = [InitState['env'], InitState['ctx']];
export interface LazyBuildResult {
  fetch: FetchFn<FetchArgs>;
}

export const buildAdapter: BuildAdapter<InitState, FetchArgs> = (r, e, c) => {
  const k: BaseContext = Object.create(context);
  k.headers = [];
  k.req = r;
  k.env = e;
  k.ctx = c;
  return k;
};

export const lazyBuild = <T extends ExportedHandler<InitState['env']>>(fn: () => ReturnType<BuildFn>, o: T = {} as T): LazyBuildResult & T => {
  (o as any as LazyBuildResult).fetch = (r, e, c) => ((o as any as LazyBuildResult).fetch = fn())(r, e, c);
  return o as any as LazyBuildResult & T;
};

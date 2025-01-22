/// <reference types="@cloudflare/workers-types" />
import router, { type Router } from '..';
import type { BuildAdapter, BuildFn, FetchFn } from '../build/types';

export interface InitState {
  // @ts-expect-error User should provide the type
  env: Env;
  ctx: ExecutionContext;
}

export default router as () => Router<InitState>;

type FetchArgs = [InitState['env'], InitState['ctx']];
export interface LazyBuildResult {
  fetch: FetchFn<FetchArgs>;
}

export const buildAdapter: BuildAdapter<InitState, FetchArgs> = (r, e, c) => ({
  headers: [],
  status: 200,
  req: r,
  env: e,
  ctx: c
});

export const lazyBuild = <T extends {}>(buildFn: BuildFn, rt: Parameters<BuildFn>[0], o: T = {} as T): LazyBuildResult & T => {
  // eslint-disable-next-line
  (o as any as LazyBuildResult).fetch = (r, e, c) => ((o as any as LazyBuildResult).fetch = buildFn(rt, buildAdapter))(r, e, c);
  return o as any as LazyBuildResult & T;
};

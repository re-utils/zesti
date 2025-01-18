/// <reference types="@cloudflare/workers-types" />
import router, { type Router } from '.';
import type { BuildFn } from './build/types';
import type { FetchFn } from './types/utils';

// @ts-expect-error User should provide the type
export default router as () => Router<[env: Env, ctx: ExecutionContext]>;

export interface LazyBuildResult {
  fetch: FetchFn;
}

export const lazyBuild = <T extends {}>(buildFn: BuildFn, args: Parameters<BuildFn>, o: T = {} as T): LazyBuildResult & T => {
  // eslint-disable-next-line
  (o as any as LazyBuildResult).fetch = (...a: [any, ...any[]]) => ((o as any as LazyBuildResult).fetch = buildFn(...args))(...a);
  return o as any as LazyBuildResult & T;
};

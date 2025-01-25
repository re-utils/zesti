/// <reference types="@cloudflare/workers-types" />
import router, { type Router } from '..';
import type { BuildAdapter, BuildFn, FetchFn } from '../build/types';
import GenericContext from '../build/context';

export class CloudflareContext extends GenericContext {
  public env: InitState['env'];
  public ctx: InitState['ctx'];

  public constructor(req: Request, env: InitState['env'], ctx: InitState['ctx']) {
    super(req);
    this.env = env;
    this.ctx = ctx;
  }
}

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

export const buildAdapter: BuildAdapter<InitState, FetchArgs> = (r, e, c) => new CloudflareContext(r, e, c) as any;

export const lazyBuild = <T extends ExportedHandler<InitState['env']>>(fn: () => ReturnType<BuildFn>, o: T = {} as T): LazyBuildResult & T => {
  // eslint-disable-next-line
  (o as any as LazyBuildResult).fetch = (r, e, c) => ((o as any as LazyBuildResult).fetch = fn())(r, e, c);
  return o as any as LazyBuildResult & T;
};

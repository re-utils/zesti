/// <reference types="@types/deno" />
import router, { type Router } from '..';
import type { BuildAdapter } from '../build/types';
import GenericContext from '../build/context';

export class DenoContext extends GenericContext {
  public info: InitState['info'];

  public constructor(req: Request, info: InitState['info']) {
    super(req);
    this.info = info;
  }
}

export interface InitState {
  info: {
    remoteAddr: Deno.Addr,
    completed: Promise<void>
  };
}

export default router as () => Router<InitState>;
export const buildAdapter: BuildAdapter<InitState, [info: InitState['info']]> = (r, i) => new DenoContext(r, i) as any;

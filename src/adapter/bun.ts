/// <reference types="@types/bun" />
import type { Server } from 'bun';
import router, { type Router } from '..';

import type { BuildAdapter } from '../build/types';
import GenericContext from '../build/context';

export class BunContext extends GenericContext {
  public server: InitState['server'];

  public constructor(req: Request, server: Server) {
    super(req);
    this.server = server;
  }
}

export interface InitState {
  server: Server;
}

export default router as () => Router<InitState>;
export const buildAdapter: BuildAdapter<InitState, [server: InitState['server']]> = (r, s) => new BunContext(r, s) as any;

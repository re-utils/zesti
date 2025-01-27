/// <reference types="@types/bun" />
import type { Server } from 'bun';
import router, { type Router } from '..';

import type { BuildAdapter } from '../build/types';
import type { Context } from '../types/route';

import context from '../build/context';

export interface InitState {
  server: Server;
}

export default router as () => Router<InitState>;
export const buildAdapter: BuildAdapter<InitState, [server: InitState['server']]> = (r, s) => {
  const c: Context & InitState = Object.create(context);
  c.req = r;
  c.server = s;
  return c;
};

/// <reference types="@types/deno" />
import router, { type Router } from '..';
import context from '../build/context';

import type { BuildAdapter } from '../build/types';
import type { Context } from '../types/route';

export interface InitState {
  info: {
    remoteAddr: Deno.Addr,
    completed: Promise<void>
  };
}

export default router as () => Router<InitState>;
export const buildAdapter: BuildAdapter<InitState, [info: InitState['info']]> = (r, i) => {
  const c: Context & InitState = Object.create(context);
  c.req = r;
  c.info = i;
  return c;
};

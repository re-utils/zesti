/// <reference types="@types/deno" />
import router, { type Router } from '.';
import type { BuildAdapter } from './build/types';

export interface InitState {
  info: {
    remoteAddr: Deno.Addr,
    completed: Promise<void>
  };
}

export default router as () => Router<InitState>;
export const buildAdapter: BuildAdapter<InitState, [info: InitState['info']]> = (r, i) => ({
  headers: [],
  status: 200,
  req: r,
  info: i
});

/// <reference types="@types/bun" />
import router, { type Router } from '.';
import type { BuildAdapter } from './build/types';

export interface InitState {
  server: ReturnType<typeof Bun['serve']>;
}

export default router as () => Router<InitState>;

export const buildAdapter: BuildAdapter<InitState, [server: InitState['server']]> = (r, s) => ({
  headers: [],
  status: 200,
  req: r,
  server: s
});

/// <reference types="@types/deno" />
import router, { type Router } from '.';

export default router as () => Router<[info: {
  remoteAddr: Deno.Addr,
  completed: Promise<void>
}]>;

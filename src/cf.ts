/// <reference types="@cloudflare/workers-types" />
import router, { type Router } from '.';

// @ts-expect-error User should provide the type
export default router as () => Router<[env: Env, ctx: ExecutionContext]>;

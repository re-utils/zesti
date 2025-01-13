/// <reference types="@types/bun" />
import router, { type Router } from '.';

export default router as () => Router<[server: ReturnType<typeof Bun['serve']>]>;

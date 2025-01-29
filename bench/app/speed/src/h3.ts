import { createApp, createRouter, defineEventHandler, toWebHandler } from "h3";
import { pathMap } from '../reqs';

const router = createRouter();

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  router.get(path, fn.length === 0
    ? defineEventHandler(fn)
    : defineEventHandler((ev) => fn(ev.context.params!.one))
  );
}

const app = createApp().use(router);
const fetch = toWebHandler(app);

export const serve = {
  fetch: (req: any, env: any, ctx: any) => fetch(req, {
    cloudflare: { env, ctx }
  })
}

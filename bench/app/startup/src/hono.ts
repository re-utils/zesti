import { Hono } from "hono/quick";
import { pathMap } from '../../reqs';
import { LinearRouter } from "hono/router/linear-router";

const app = new Hono({ router: new LinearRouter() });

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  app.get(path, fn.length === 0
    ? (c) => c.body(fn())
    : (c) => c.body(fn(c.req.param('one')))
  );
}

export const serve = app;

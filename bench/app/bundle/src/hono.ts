import { Hono } from "hono/tiny";
import { pathMap } from '../../reqs';
import { PatternRouter } from "hono/router/pattern-router";

const app = new Hono({ router: new PatternRouter() });

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  app.get(path, fn.length === 0
    ? (c) => c.body(fn())
    : (c) => c.body(fn(c.req.param('one')))
  );
}

export const serve = app;

import { Hono } from "hono";
import { pathMap } from '../../reqs';
import { RegExpRouter } from "hono/router/reg-exp-router";
import { cors } from "hono/cors";

const app = new Hono({ router: new RegExpRouter() }).use(
  cors({
    allowMethods: ['GET'],
    origin: '*'
  }
));

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  app.get(path, fn.length === 0
    ? (c) => c.body(fn())
    : (c) => c.body(fn(c.req.param('one')))
  );
}

export const serve = app;

import { Hono } from "hono/quick";
import { LinearRouter } from "hono/router/linear-router";

const app = new Hono({ router: new LinearRouter() });

for (let i = 0; i < 50; i++)
  app.get('/' + i, (c) => c.body('Hi'));

for (let i = 0; i < 20; i++)
  app.get('/:a/' + i, (c) => c.body(c.req.param("a")!));

export const serve = app;

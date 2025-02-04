import { Hono } from "hono/quick";
import { LinearRouter } from "hono/router/linear-router";

const app = new Hono({ router: new LinearRouter() });

for (let i = 0; i < 100; i++)
  app.get('/' + i, (c) => c.body('Hi'));

for (let i = 0; i < 25; i++)
  app.get(`/${i}/:a/${i}`, (c) => c.body(c.req.param("a")!));

// Build Hono
app.fetch(new Request('http://localhost'));

export const serve = app;

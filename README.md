# Zesti
A small and fast Edge framework.

```ts
import router from 'zesti';

// Use the build preset that emits the fastest handler
import build from 'zesti/build/fast';

// Create a router
const app = router()
  .get('/', (c) => c.send('Hi'))
  .get('/*', (params, c) => c.send(params[0]));

export default {
  // Build the router and send it
  // to the runtime to run
  fetch: build(app)
};
```

## Speed
Zesti is the fastest, compared to other Cloudflare Workers frameworks.

```
clk: ~0.36 GHz
cpu: Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
runtime: node 22.13.1 (x64-linux)

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
H3                            46.73 ms/iter  50.41 ms        █
                      (27.68 ms … 63.58 ms)  61.44 ms ▅      █▅ ▅▅▅▅ ▅    ▅
                    (  1.97 gb …   6.62 gb)   4.46 gb █▁▁▁▁▁▁██▁████▁█▁▁▁▁█
Hono                          19.62 ms/iter  23.85 ms ███          ▂ █
                      (13.72 ms … 28.83 ms)  27.65 ms ███▅        ▅█▅█ ▅
                    (  3.81 gb …   6.21 gb)   5.19 gb ████▇▁▁▇▁▁▁▁████▇█▁▁▇
Zesti                         17.19 ms/iter  22.93 ms █
                      (12.81 ms … 26.40 ms)  25.95 ms █▃
                    (  3.75 gb …   3.78 gb)   3.75 gb ██▅▃▃▅▁▃▁▁▁▃▁▃▁▅▅█▃▁▃

                             ┌                                            ┐
                          H3 ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 46.73 ms
                        Hono ┤■■■ 19.62 ms
                       Zesti ┤ 17.19 ms
                             └                                            ┘
```

This benchmark measures the time for each framework to handle 1,000 request objects.
You can run the benchmark by cloning the reposity and run:
```sh
# Require Bun for scripts
bun task bench --node
```

## Size
Zesti main module is under 1KB bytes minified, and the largest build preset is under 3KB minified. Other components are only bundled when necessary.

## Cross runtime
Zesti works on every runtime by default.

You can access runtime-specific properties using adapters:
```ts
import { router, buildAdapter } from 'zesti/adapter/bun';
import build from 'zesti/build/fast';

const app = router()
  .get('/', (c) => {
    console.log(c.server); // Access Bun server info
    return c.send('Hi');
  });

Bun.serve({
  fetch: build(app, buildAdapter);
});
```

Runtimes with an adapter includes:
- **Bun**: `zesti/adapter/bun`
- **Deno**: `zesti/adapter/deno`
- **Cloudflare**: `zesti/adapter/cloudflare`

With Cloudflare, you need to use `lazyBuild` from the adapter package.
```ts
import { router, lazyBuild, buildAdapter } from 'zesti/adapter/cloudflare';
import build from 'zesti/build/fast';

const app = router()
  .get('/', (c) => {
    console.log(c.env, c.ctx); // Access cloudflare Env and Context
    return c.send('Hi');
  });

// Pass a build function and your app
export default lazyBuild(() => build(app, buildAdapter));

// Add other Cloudflare methods
export default lazyBuild(() => build(app, buildAdapter), {
  scheduled: async (controller, env, ctx) => {
    // Handle cronjob...
  },

  // Other methods...
})
```

## DX
Zesti has a level of developer experience you would expect from modern frameworks, with server and client type safety.

A really simple example is strictly typed path parameters and router.
```ts
// App is inferred with route handler types
const app = router()
  // Path parameters are strictly typed so you don't access unknown values
  .get('/user/*/info', (params, c) => c.send(params[0]))
  .get('/user/*/**', (params, c) => c.send(params[0] + params[1]));
```

Zesti has a small client for querying on the frontend and testing on the backend.
```ts
// @server/main.ts
const app = router()
  .get('/', (c) => c.send('Hi', 200))
  .get('/*', (params, c) => c.send(params[0], 200));

export default app;

// client.ts
import type app from '@server/main';
import client from 'zesti/client';

const app = client<typeof app>(
  'http://localhost:3000', // The root path for querying
  ['get'] // Exposed methods (for improved performance and type autocomplete in browsers)
);

{
  // Path autocomplete
  const res = await app.get('/');
  await res.text(); // 'Hi'
}

{
  // Infer that you need params for dynamic paths
  const res = await app.get('/*', {
    params: ['Hi']
  });
  await res.text(); // 'Hi'
}

// backend.test.ts
import app from '@server/main';
import client from 'zesti/client/test';

// No need to manually expose methods like the client
// Use this to test your backend code
const tester = client(app);
```

# Zesti
A small and fast Edge framework.

```ts
import router from 'zesti';

// Use the build preset that emits the fastest handler
import build from 'zesti/build/fast';

// Create a router
const app = router()
  .get('/', () => 'Hi')
  .get('/*', (params) => params[0]);

export default {
  // Build the router and send it
  // to the runtime to run
  fetch: build(app)
};
```

## Speed
Zesti is the fastest, compared to other Edge web frameworks.

- clk: ~0.37 GHz
- cpu: Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
- runtime: node 22.13.1 (x64-linux)

| benchmark |              avg |         min |         p75 |         p99 |         max |
| ------ | ---------------- | ----------- | ----------- | ----------- | ----------- |
| H3     | ` 36.60 ms/iter` | ` 27.28 ms` | ` 38.52 ms` | ` 47.79 ms` | ` 57.51 ms` |
| Hono   | ` 25.87 ms/iter` | ` 19.36 ms` | ` 26.24 ms` | ` 33.77 ms` | ` 38.45 ms` |
| Zesti  | ` 17.62 ms/iter` | ` 15.34 ms` | ` 18.82 ms` | ` 19.49 ms` | ` 19.96 ms` |
| Elysia | ` 19.78 ms/iter` | ` 15.49 ms` | ` 21.67 ms` | ` 22.59 ms` | ` 23.65 ms` |

Benchmarks the time for each framework to handle 1,000 `Request` object.
You can run the benchmark by cloning the reposity and run:
```sh
# Require Bun for scripts
bun task bench --node
```

## Size
Zesti main module is only 675 bytes minified, and the largest build preset is under 2kB minified.
There are many built-in middlewares but they only get bundled when necessary.

## Runtime-agnostic
Zesti is runtime-agnostic by default.

You can access runtime-specific properties using adapters:
```ts
import { router, buildAdapter } from 'zesti/adapter/bun';
import build from 'zesti/build/fast';

const app = router()
  .get('/', (c) => {
    console.log(c.server); // Access Bun server info
    return 'Hi';
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
import { router, lazyBuild } from 'zesti/adapter/cloudflare';
import build from 'zesti/build/fast';

const app = router()
  .get('/', (c) => {
    console.log(c.env, c.ctx); // Access cloudflare Env and Context
    return 'Hi';
  });

// Pass a build function and your app
// Automatically build using the cloudflare build adapter
export default lazyBuild(build, app);
```

## DX
Zesti has a level of developer experience you would expect from modern frameworks, with server and client type safety.

A really simple example is strictly typed path parameters and router.
```ts
// App is inferred with route handler types
const app = router()
  // Path parameters are strictly typed so you don't access unknown values
  .get('/user/*/info', (params) => params[0])
  .get('/user/*/**', (params) => params[0] + params[1]);
```

Zesti has a small client for querying on the frontend and testing on the backend.
```ts
// @server/main.ts
const app = router()
  .get('/', () => 'Hi')
  .get('/*', (params) => params[0]);

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
import client from 'zesti/client';

// No need to manually expose methods like the client
const tester = client(app);
```

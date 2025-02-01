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

## Cross runtime
Zesti works on every runtime by default.

You can access runtime-specific properties using adapters:
```ts
import router, { buildAdapter } from 'zesti/adapter/bun';
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
import router, { lazyBuild, buildAdapter } from 'zesti/adapter/cloudflare';
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

# Benchmarks
These benchmarks are executed on every published version of Zesti.

You can run the benchmark locally by cloning the repo and run:
```sh
# Require Bun and hyperfine
bun task bench-app --node
```

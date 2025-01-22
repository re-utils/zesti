# Zesti
A small and fast Edge framework.

```ts
import router from 'zesti';

// Use the fastest builder
import build from 'zesti/build/fast';

// Use with cloudflare
import { lazyBuild } from 'zesti/adapter/cloudflare';

// Create a router
const app = router()
  .get('/', () => 'Hi')
  .get('/*', (params) => params[0]);

// Run with Bun or Deno or other runtimes
export default {
  // Build the router and send it
  // to the runtime to run
  fetch: build(app)
};

// Or with Cloudflare
export default lazyBuild(build, app);
```

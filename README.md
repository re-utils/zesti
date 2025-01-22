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

## Speed
**Zesti** is the fastest compared to other Edge web frameworks.

- clk: ~0.37 GHz
- cpu: Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
- runtime: node 22.13.1 (x64-linux)

| benchmark |              avg |         min |         p75 |         p99 |         max |
| ------ | ---------------- | ----------- | ----------- | ----------- | ----------- |
| H3     | ` 36.60 ms/iter` | ` 27.28 ms` | ` 38.52 ms` | ` 47.79 ms` | ` 57.51 ms` |
| Hono   | ` 25.87 ms/iter` | ` 19.36 ms` | ` 26.24 ms` | ` 33.77 ms` | ` 38.45 ms` |
| Zesti  | ` 17.62 ms/iter` | ` 15.34 ms` | ` 18.82 ms` | ` 19.49 ms` | ` 19.96 ms` |
| Elysia | ` 19.78 ms/iter` | ` 15.49 ms` | ` 21.67 ms` | ` 22.59 ms` | ` 23.65 ms` |

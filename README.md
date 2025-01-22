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

### Performance
Zesti is build for performance:
```console
Testing H3
* Match path "/user" with "/user"
* Match path "/user/comments" with "/user/comments"
* Match path "/user/avatar" with "/user/avatar"
* Match path "/user/lookup/email/0.31634221493042913" with "/user/lookup/email/:one"
* Match path "/event/0.31634221493042913" with "/event/:one"
* Match path "/event/0.31634221493042913/comments" with "/event/:one/comments"
* Match path "/very/deeply/nested/route/hello/there" with "/very/deeply/nested/route/hello/there"
* Match path "/user/lookup/username/0.31634221493042913" with "/user/lookup/username/:one"
Testing Hono
* Match path "/user" with "/user"
* Match path "/user/comments" with "/user/comments"
* Match path "/user/avatar" with "/user/avatar"
* Match path "/user/lookup/email/0.9563271066513337" with "/user/lookup/email/:one"
* Match path "/event/0.9563271066513337" with "/event/:one"
* Match path "/event/0.9563271066513337/comments" with "/event/:one/comments"
* Match path "/very/deeply/nested/route/hello/there" with "/very/deeply/nested/route/hello/there"
* Match path "/user/lookup/username/0.9563271066513337" with "/user/lookup/username/:one"
Testing Zesti
* Match path "/user" with "/user"
* Match path "/user/comments" with "/user/comments"
* Match path "/user/avatar" with "/user/avatar"
* Match path "/user/lookup/email/0.51183779652717" with "/user/lookup/email/:one"
* Match path "/event/0.51183779652717" with "/event/:one"
* Match path "/event/0.51183779652717/comments" with "/event/:one/comments"
* Match path "/very/deeply/nested/route/hello/there" with "/very/deeply/nested/route/hello/there"
* Match path "/user/lookup/username/0.51183779652717" with "/user/lookup/username/:one"
Testing Elysia
* Match path "/user" with "/user"
* Match path "/user/comments" with "/user/comments"
* Match path "/user/avatar" with "/user/avatar"
* Match path "/user/lookup/email/0.3341462968146732" with "/user/lookup/email/:one"
* Match path "/event/0.3341462968146732" with "/event/:one"
* Match path "/event/0.3341462968146732/comments" with "/event/:one/comments"
* Match path "/very/deeply/nested/route/hello/there" with "/very/deeply/nested/route/hello/there"
* Match path "/user/lookup/username/0.3341462968146732" with "/user/lookup/username/:one"
[90mclk: ~0.39 GHz[0m
[90mcpu: Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz[0m
[90mruntime: bun 1.1.45 (x64-linux)[0m

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
H3                           [1m[33m 29.84 ms[0m[1m/iter[0m [90m 31.94 ms[0m [36m        █  [0m[33m [0m[35m  █      [0m
                      [90m([0m[36m23.62 ms[0m[90m … [0m[35m37.40 ms[0m[90m)[0m [90m 34.68 ms[0m [36m█▁█▁█▁▁██▁▁[0m[33m▁[0m[35m▁▁██▁▁▁██[0m
                  [90mgc([0m[34m 16.43 ms[0m[90m … [0m[34m 50.19 ms[0m[90m)[0m [33m  3.47 gb[0m[90m ([0m[33m320.00 mb[0m[90m…[0m[33m  7.00 gb[0m[90m)[0m
Hono                         [1m[33m 19.06 ms[0m[1m/iter[0m [90m 20.42 ms[0m [36m  █  █  [0m[33m [0m[35m            [0m
                      [90m([0m[36m15.52 ms[0m[90m … [0m[35m28.22 ms[0m[90m)[0m [90m 24.62 ms[0m [36m██████▁▁[0m[33m▁[0m[35m▁▁█▁▁█▁▁▁▁▁█[0m
                  [90mgc([0m[34m 51.23 ms[0m[90m … [0m[34m 60.05 ms[0m[90m)[0m [33m  1.47 gb[0m[90m ([0m[33m824.00 mb[0m[90m…[0m[33m  1.88 gb[0m[90m)[0m
Zesti                        [1m[33m  3.72 ms[0m[1m/iter[0m [90m  3.75 ms[0m [36m █     █  [0m[33m [0m[35m          [0m
                        [90m([0m[36m3.36 ms[0m[90m … [0m[35m4.35 ms[0m[90m)[0m [90m  4.11 ms[0m [36m██▁▁▁▁▁█▁█[0m[33m█[0m[35m▁▁▁▁█▁▁▁▁█[0m
                  [90mgc([0m[34m 45.39 ms[0m[90m … [0m[34m 57.22 ms[0m[90m)[0m [33m164.57 mb[0m[90m ([0m[33m  0.00  b[0m[90m…[0m[33m640.00 mb[0m[90m)[0m
Elysia                       [1m[33m 14.29 ms[0m[1m/iter[0m [90m 14.05 ms[0m [36m█ █    [0m[33m [0m[35m             [0m
                      [90m([0m[36m12.33 ms[0m[90m … [0m[35m21.08 ms[0m[90m)[0m [90m 17.96 ms[0m [36m█▁█▆▆▁▆[0m[33m▁[0m[35m▁▁▁▁▆▁▁▁▁▁▁▁▆[0m
                  [90mgc([0m[34m 49.99 ms[0m[90m … [0m[34m 79.37 ms[0m[90m)[0m [33m  1.33 gb[0m[90m ([0m[33m896.00 mb[0m[90m…[0m[33m  1.50 gb[0m[90m)[0m

                             ┌                                            ┐
                          H3 ┤[90m■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■[0m [33m29.84 ms[0m
                        Hono ┤[90m■■■■■■■■■■■■■■■■■■■■[0m [33m19.06 ms[0m
                       Zesti ┤[90m[0m [33m3.72 ms[0m
                      Elysia ┤[90m■■■■■■■■■■■■■■[0m [33m14.29 ms[0m
                             └                                            ┘
```

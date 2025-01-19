import { barplot as plot, run, bench, do_not_optimize } from 'mitata';
import assert from 'node:assert';

// Apps
import elysia from './src/elysia';
import h3 from './src/h3';
import hono from './src/hono';
import zesti from './src/zesti';

// Zesti has types for these stuff
import type { FetchFn } from 'zesti/build/types';
import { requests, setupTests } from './reqs';

const apps: [string, { fetch: FetchFn }][] = [
  ['H3', h3],
  ['Hono', hono],
  ['Zesti', zesti],
  ['Elysia', elysia]
];

(async () => {
  for (const [name, obj] of apps)
    await setupTests(name, assert.strictEqual, obj);

  // Main
  plot(() => {
    for (const [name, obj] of apps) {
      requests.forEach((t: Request) => obj.fetch(t));

      bench(name, () => {
        for (let i = 0; i < requests.length; i++)
          do_not_optimize(obj.fetch(requests[i]));
      }).gc('inner');
    }
  });

  // Start the benchmark
  run();
})();

import { barplot as plot, run, bench, do_not_optimize } from 'mitata';
import assert from 'node:assert';

// Apps
import { serve as h3 } from './src/h3';
import { serve as hono } from './src/hono';
import { serve as zesti } from './src/zesti';

// Zesti has types for these stuff
import type { FetchFn } from 'zesti/build/types';
import { requests, setupTests } from '../reqs';
import { defaultConfig } from '@lib';

const apps: [string, { fetch: FetchFn }][] = [
  ['H3', h3],
  ['Hono', hono],
  ['Zesti', zesti]
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
      });
    }
  });

  // Start the benchmark
  run(defaultConfig);
})();

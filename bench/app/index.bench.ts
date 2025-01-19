import { barplot as plot, run, bench, do_not_optimize } from 'mitata';

// Apps
import elysia from './src/elysia';
import h3 from './src/h3';
import hono from './src/hono';
import zesti from './src/zesti';

// Zesti has types for these stuff
import type { FetchFn } from 'zesti/build/types';

// Example benchmark
plot(() => {
  const apps: [string, { fetch: FetchFn }][] = [
    ['H3', h3],
    ['Hono', hono],
    ['Zesti', zesti],
    ['Elysia', elysia]
  ];

  const reqs = Array.from({ length: 5000 }, (_, i) => (i %= 20, new Request(
    'http://127.0.0.1:3000' + (i === 0
      ? '/user'
      : i === 1
        ? '/user/comments'
        : i === 2
          ? '/user/avatar'
          : i === 3
            ? `/user/lookup/email/${Math.random()}`
            : i === 4
              ? `/event/${Math.random()}`
              : i === 5
                ? `/event/${Math.random()}/comments`
                : i === 6
                  ? '/very/deeply/nested/route/hello/there'
                  : `/user/lookup/username/${Math.random()}`)
  )));
  console.log('Done setting up requests...');

  for (const [name, obj] of apps) {
    reqs.forEach((t: Request) => obj.fetch(t));
    console.log(obj.fetch.toString());

    bench(name, () => {
      for (let i = 0; i < reqs.length; i++)
        do_not_optimize(obj.fetch(reqs[i]));
    }).gc('inner');
  }
  console.log('Done setting up apps...');
});

// Start the benchmark
run();

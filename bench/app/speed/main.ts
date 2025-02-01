import { barplot as plot, run, bench, do_not_optimize } from 'mitata';
import assert from 'node:assert';

// Apps
import loadApps from './src';

// Zesti has types for these stuff
import { requests, setupTests } from '../reqs';
import { defaultConfig } from '@lib';

// const block = (globalName: keyof typeof globalThis) => {
//   const x = globalThis[globalName];
//   // @ts-ignore
//   globalThis[globalName] = new Proxy(x, {
//     apply() {
//       throw new Error('Cannot use this');
//     },
//     construct() {
//       throw new Error('Cannot use this');
//     }
//   });
// }

// // Block this
// block('Function');
// block('eval');

(async () => {
  const apps = await loadApps();

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

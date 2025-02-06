import { defaultConfig } from '@lib';
import { summary, run, bench, do_not_optimize } from 'mitata';

summary(() => {
  const arr = new Array(500 + Math.round(Math.random() * 8)).fill(0).map(Math.random);

  bench('At', () => do_not_optimize(arr.at(-1)));
  bench('Direct access', () => do_not_optimize(arr[arr.length - 1]));
});

run(defaultConfig);

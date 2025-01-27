import { defaultConfig } from '@lib';
import { summary, run, bench, do_not_optimize } from 'mitata';

summary(() => {
  const symbols = new Array(10).fill(0).map(Symbol);
  const strs = new Array(10).fill(0).map((_, i) => i * 18).map(String);

  const fnSym = Function(...symbols.map((_, i) => 'f' + i), `
    return (x) => {
      switch (x) {
        ${symbols.map((_, i) => `case f${i}:return ${i};`).join('')}
      }
      return null;
    }
  `)(...symbols);

  const fnStr = Function(...strs.map((_, i) => 'f' + i), `
    return (x) => {
      switch (x) {
        ${strs.map((_, i) => `case f${i}:return ${i};`).join('')}
      }
      return null;
    }
  `)(...strs);

  bench('Symbol', () => do_not_optimize(symbols.map(fnSym)));
  bench('String', () => do_not_optimize(symbols.map(fnStr)));
});

run(defaultConfig);

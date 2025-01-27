import { defaultConfig } from '@lib';
import { summary, run, bench, do_not_optimize } from 'mitata';

summary(() => {
  const proto = {
    headers: [],
    status: 200,
    req: null
  };

  const init = (r: any) => {
    const x = Object.create(proto);
    x.req = r;
    return x;
  }

  class Proto {
    headers: [];
    status: number;
    req: any;

    constructor(x: any) {
      this.headers = [];
      this.status = 200;
      this.req = x;
    }
  }

  bench('Class', () => do_not_optimize(new Proto(Math.random())));
  bench('Object.create', () => do_not_optimize(init(Math.random())));
});

run(defaultConfig);

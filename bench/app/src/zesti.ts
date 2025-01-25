import router from 'zesti';
import build from 'zesti/build/fast';
import { pathMap } from '../reqs';

const app = router();

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  // @ts-expect-error Nvm
  app.get(path.replace(/\/:\w+/g, '/*'), path.includes(':')
    ? (params: string[], c: any) => c.body(fn(params[0]))
    : (c) => c.body(fn())
  );
}

export default { fetch: build(app) };

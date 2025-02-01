import router, { lazyBuild, buildAdapter } from 'zesti/adapter/cloudflare';
import build from 'zesti/build/fast';
import cors from 'zesti/utils/cors';
import { pathMap } from '../../reqs';

const app = router()
  .use(cors('*', {
    allowMethods: 'GET'
  }));

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];

  // @ts-expect-error Nvm
  app.get(path.replace(/\/:\w+/g, '/*'), path.includes(':')
    ? (params: string[], c: any) => c.send(fn(params[0]))
    : (c) => c.send(fn())
  );
}

export const serve = lazyBuild(() => build(app, buildAdapter));

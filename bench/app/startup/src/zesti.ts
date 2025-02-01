import router, { lazyBuild, buildAdapter } from 'zesti/adapter/cloudflare';
import build from 'zesti/build/fast';

const app = router();

for (let i = 0; i < 100; i++)
  app.get('/' + i, (c) => c.send('Hi'));

for (let i = 0; i < 25; i++)
  app.get(`/*/${i}`, (params, c) => c.send(params[0]));

export const serve = lazyBuild(() => build(app, buildAdapter));

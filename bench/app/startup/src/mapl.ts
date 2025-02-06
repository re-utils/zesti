import { router, jitc } from '@mapl/app';

const app = router();

for (let i = 0; i < 100; i++)
  app.get('/' + i, () => 'Hi');

for (let i = 0; i < 25; i++)
  app.get(`/${i}/*`, (params) => params[0]);

(await jitc(app)).fetch(new Request('http://localhost'));

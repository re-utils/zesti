import { bench } from '@ark/attest';

import router from 'zesti';
import client from 'zesti/client';

import { Hono } from 'hono';
import { hc } from 'hono/client';

import Elysia from 'elysia';
import { treaty } from '@elysiajs/eden';

let _: any;

bench('Elysia - Eden Treaty', () => {
  const navigate = new Elysia({ prefix: '/navigate' })
    .all('/*', (c) => c.params['*']);

  const server = new Elysia()
    .get('/', () => 'Hi')
    .post('/json/:param', (c) => ({
      param: c.params.param
    }), { type: 'json' })
    .use(navigate);

  const app = treaty<typeof server>('http://localhost:3000');

  _ = app.index.get();
  _ = app.json({ param: 'Hi' }).post();
  _ = app.navigate['*'].get();
}).types();

bench('Hono', () => {
  const navigate = new Hono()
    .all('/:rest{.+$}', (c) => c.body(c.req.param('rest')));

  const server = new Hono()
    .get('/', (c) => c.body('Hi'))
    .post('/json/:param', (c) => c.json({
      param: c.req.param('param')
    }))
    .route('/navigate', navigate);

  const app = hc<typeof server>('http://localhost:3000');

  _ = app.index.$get();
  _ = app.index.$get();
  _ = app.json[':param'].$post({ param: { param: 'Hi' } });
  _ = app.navigate[':rest{.+$}'].$all({ param: { rest: 'Hi' } });
}).types();

bench('Zesti', () => {
  const navigate = router()
    .any('/**', (params, c) => c.send(params[0]));

  const server = router()
    .get('/', (c) => c.send('Hi'))
    .post('/json/*', (params, c) => c.json({
      param: params[0]
    }))
    .route('/navigate', navigate);

  const app = client<typeof server>('http://localhost:3000', ['get', 'post', '$']);

  _ = app.get('/');
  _ = app.post('/json/*', {
    params: ['Hi']
  });
  _ = app.$('/navigate/**', {
    params: ['Hi']
  });
}).types();

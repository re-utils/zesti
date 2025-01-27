import { describe, test, expect } from 'bun:test';

import router, { defineMiddleware } from 'zesti';
import client from 'zesti/client/test';

describe('Match route', () => {
  const server = router()
    .get('/', (c) => c.send('Hi'))
    .get('/*', (params, c) => c.send(params[0]))
    .post("/json", (c) => c.json({ now: performance.now() }));

  const app = client(server);

  test('GET /', async () => {
    const res = await app.get('/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hi');
  });

  test('GET /*', async () => {
    const res = await app.get('/*', {
      params: ['Hi']
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hi');
  });

  test('POST /json', async () => {
    const res = await app.post('/json');
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveProperty('now');
  });
});

describe('Body parsing', () => {
  const parseBody = defineMiddleware<{ body: string }>(async (next, c) => {
    c.body = await c.req.text();
    return next();
  });

  const server = router()
    .use(parseBody)
    .post('/', (c) => c.send(c.body));

  const app = client(server);

  test('POST /', async () => {
    const res = await app.post('/', {
      body: 'Hi'
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hi');
  });
});

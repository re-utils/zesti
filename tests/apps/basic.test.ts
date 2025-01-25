import { describe, test, expect } from 'bun:test';

import router from 'zesti';
import client from 'zesti/client/test';
import type { PickIfExists } from 'zesti/types/utils';

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
  const server = router()
    .use<{ body: string }>(async (next, c) => {
      c.body = await c.req.text();
      return next();
    })
    .post('/', (c) => c.send(c.body));

  const app = client(server);

  describe('POST /', async () => {
    const res = await app.post('/', {
      body: 'Hi'
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toHaveProperty('Hi');
  });
});

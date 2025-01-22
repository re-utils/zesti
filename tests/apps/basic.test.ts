import { describe, test, expect } from 'bun:test';

import router from 'zesti';
import client from 'zesti/client/test';

describe('Match route', () => {
  const server = router()
    .get('/', () => 'Hi')
    .get('/*', (params) => params[0])
    .post("/json", {
      type: 'json',
      fn: () => ({ now: performance.now() })
    });

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

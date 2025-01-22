import { describe, test, expect } from 'bun:test';

import router from 'zesti';
import client from 'zesti/client/test';

describe('Match route', () => {
  const route = router()
    .get('/', () => 'Hi')
    .get('/*', (params) => params[0]);

  const $ = client(route);

  test('/', async () => {
    const res = await $.get('/');
    expect(await res.text()).toBe('Hi');
  });

  test('/*', async () => {
    const res = await $.get('/*', {
      params: ['Hi']
    });
    expect(await res.text()).toBe('Hi');
  });
});

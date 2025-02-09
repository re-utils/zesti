import { describe, test, expect } from 'bun:test';

import router, { fn } from 'zesti';
import client from 'zesti/client/test';

import validator from 'zesti/utils/body/assert-json';
import { invalidBodyFormat } from 'zesti/utils/body/error';

import { build } from 'stnl/compilers/validate-json';

describe('Body parsing', () => {
  const schema = build({
    props: {
      msg: 'string'
    }
  });

  const server = router()
    .use(validator(schema))
    .catch(invalidBodyFormat, (c) => c.send('Invalid body', 400))
    .post('/', (c) => c.json(c.body, 200));

  const app = client(server);

  test('POST /', async () => {
    const res = await app.post('/', {
      body: {
        msg: 'Hi'
      }
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ msg: 'Hi' });
  });
});

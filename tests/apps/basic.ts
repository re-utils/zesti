import router from 'zesti';
import build from 'zesti/build/fast';

const app = router()
  .get('/', () => 'Hi')
  .get('/*', (params) => params[0]);

export default { fetch: build(app) };

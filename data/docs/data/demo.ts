import router from 'zesti';
import build from 'zesti/build/fast';

const app = router()
  .get('/', (c) => c.send('Hi'));

export default {
  fetch: build(app)
};

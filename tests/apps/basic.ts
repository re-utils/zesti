import router from '@mapl/tiny';
import compile from '@mapl/tiny/tiers/3';

const app = router()
  .get('/', () => 'Hi')
  .get('/*', (params) => params[0]);

export default {
  fetch: compile(app)
}

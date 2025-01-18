import router from 'zesti';
import build from 'zesti/build/fast';

const app = router()
  .get('/user', () => 'User')
  .get('/user/comments', () => 'User Comments')
  .get('/user/avatar', () => 'User Avatar')
  .get('/user/lookup/email/*', () => 'User Lookup Email Address')
  .get('/event/*', () => 'Event')
  .get('/event/*/comments', () => 'Event Comments')
  .get('/very/deeply/nested/route/hello/there', () => 'Very Deeply Nested Route')
  .get('/user/lookup/username/*', (params) => `Hello ${params[0]}`);

export default { fetch: build(app) };

import { Elysia } from 'elysia';

const app = new Elysia({ aot: false })
  .get('/user', () => 'User')
  .get('/user/comments', () => 'User Comments')
  .get('/user/avatar', () => 'User Avatar')
  .get('/user/lookup/email/:address', () => 'User Lookup Email Address')
  .get('/event/:id', () => 'Event')
  .get('/event/:id/comments', () => 'Event Comments')
  .get('/very/deeply/nested/route/hello/there', () => 'Very Deeply Nested Route')
  .get('/user/lookup/username/:username', (c) => `Hello ${c.params.username}`);

// Pls don't kill my TSC
export default app as any;

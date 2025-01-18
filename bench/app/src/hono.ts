import { Hono } from "hono";

export default new Hono()
  .get('/user', (c) => c.body('User'))
  .get('/user/comments', (c) => c.body('User Comments'))
  .get('/user/avatar', (c) => c.body('User Avatar'))
  .get('/user/lookup/email/:address', (c) => c.body('User Lookup Email Address'))
  .get('/event/:id', (c) => c.body('Event'))
  .get('/event/:id/comments', (c) => c.body('Event Comments'))
  .get('/very/deeply/nested/route/hello/there', (c) => c.body('Very Deeply Nested Route'))
  .get('/user/lookup/username/:username', (c) => c.body(`Hello ${c.req.param('username')}`));

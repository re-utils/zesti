import { createApp, createRouter, defineEventHandler, toWebHandler } from "h3";

const router = createRouter()
  .get('/user', defineEventHandler(() => 'User'))
  .get('/user/comments', defineEventHandler(() => 'User Comments'))
  .get('/user/avatar', defineEventHandler(() => 'User Avatar'))
  .get('/user/lookup/email/:address', defineEventHandler(() => 'User Lookup Email Address'))
  .get('/event/:id', defineEventHandler(() => 'Event'))
  .get('/event/:id/comments', defineEventHandler(() => 'Event Comments'))
  .get('/very/deeply/nested/route/hello/there', defineEventHandler(() => 'Very Deeply Nested Route'))
  .get('/user/lookup/username/:username', defineEventHandler((event) => `Hello ${event.context.params!.username}`))

const app = createApp().use(router);

export default {
  fetch: toWebHandler(app)
}

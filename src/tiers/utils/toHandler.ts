import type { AnyHandler, AnyTypedHandler, Context } from '../../types/route';
import { isAsync } from '../../utils';

const text = ['content-type', 'text/plain'] as const;
const html = ['content-type', 'text/html'] as const;
const json = ['content-type', 'application/json'] as const;

export default (handler: AnyHandler, isScopeAsync: boolean, hasParam: boolean): (...c: any[]) => any => {
  let type: AnyTypedHandler['type'];
  let fn: (...c: any[]) => any;

  if (typeof handler === 'function') {
    type = 'buffer';
    fn = handler;
  } else {
    type = handler.type;
    fn = handler.fn;
  }

  isScopeAsync ||= isAsync(fn);

  switch (type) {
    case 'buffer':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: any, ...a: any[]) => new Response(await fn(p, c, ...a), c)
          : async (c: any, ...a: any[]) => new Response(await fn(c, ...a), c)
        : hasParam
          ? (p: any, c: any, ...a: any[]) => new Response(fn(p, c, ...a), c)
          : (c: any, ...a: any[]) => new Response(fn(c, ...a), c);

    case 'plain':
      return fn;

    case 'text':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: Context, ...a: any[]) => {
            c.headers.push(text);
            return new Response(await fn(p, c, ...a), c as any);
          }
          : async (c: Context, ...a: any[]) => {
            c.headers.push(text);
            return new Response(await fn(c, ...a), c as any);
          }
        : hasParam
          ? (p: any, c: Context, ...a: any[]) => {
            c.headers.push(text);
            return new Response(fn(p, c, ...a), c as any);
          }
          : (c: Context, ...a: any[]) => {
            c.headers.push(text);
            return new Response(fn(c, ...a), c as any);
          };

    case 'html':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: Context, ...a: any[]) => {
            c.headers.push(html);
            return new Response(await fn(p, c, ...a), c as any);
          }
          : async (c: Context, ...a: any[]) => {
            c.headers.push(html);
            return new Response(await fn(c, ...a), c as any);
          }
        : hasParam
          ? (p: any, c: Context, ...a: any[]) => {
            c.headers.push(html);
            return new Response(fn(p, c, ...a), c as any);
          }
          : (c: Context, ...a: any[]) => {
            c.headers.push(html);
            return new Response(fn(c, ...a), c as any);
          };

    case 'json':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: Context, ...a: any[]) => {
            c.headers.push(json);
            return new Response(await fn(p, c, ...a), c as any);
          }
          : async (c: Context, ...a: any[]) => {
            c.headers.push(json);
            return new Response(await fn(c, ...a), c as any);
          }
        : hasParam
          ? (p: any, c: Context, ...a: any[]) => {
            c.headers.push(json);
            return new Response(fn(p, c, ...a), c as any);
          }
          : (c: Context, ...a: any[]) => {
            c.headers.push(json);
            return new Response(fn(c, ...a), c as any);
          };
  }
};

import type { AnyHandler, AnyTypedHandler, Context } from '../../../types/route';
import { isAsync } from '../../utils';

const text = ['content-type', 'text/plain'] as const;
const html = ['content-type', 'text/html'] as const;
const json = ['content-type', 'application/json'] as const;

export default (handler: AnyHandler, hasParam: boolean): (...c: any[]) => any => {
  let type: AnyTypedHandler['type'];
  let fn: (...c: any[]) => any;

  if (typeof handler === 'function') {
    type = 'buffer';
    fn = handler;
  } else {
    type = handler.type;
    fn = handler.fn;
  }

  const isScopeAsync = isAsync(fn);

  switch (type) {
    case 'buffer':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: any) => new Response(await fn(p, c), c)
          : async (c: any) => new Response(await fn(c), c)
        : hasParam
          ? (p: any, c: any) => new Response(fn(p, c), c)
          : (c: any) => new Response(fn(c), c);

    case 'plain':
      return fn;

    case 'text':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: Context) => {
            c.headers.push(text);
            return new Response(await fn(p, c), c as any);
          }
          : async (c: Context) => {
            c.headers.push(text);
            return new Response(await fn(c), c as any);
          }
        : hasParam
          ? (p: any, c: Context) => {
            c.headers.push(text);
            return new Response(fn(p, c), c as any);
          }
          : (c: Context) => {
            c.headers.push(text);
            return new Response(fn(c), c as any);
          };

    case 'html':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: Context) => {
            c.headers.push(html);
            return new Response(await fn(p, c), c as any);
          }
          : async (c: Context) => {
            c.headers.push(html);
            return new Response(await fn(c), c as any);
          }
        : hasParam
          ? (p: any, c: Context) => {
            c.headers.push(html);
            return new Response(fn(p, c), c as any);
          }
          : (c: Context) => {
            c.headers.push(html);
            return new Response(fn(c), c as any);
          };

    case 'json':
      return isScopeAsync
        ? hasParam
          ? async (p: any, c: Context) => {
            c.headers.push(json);
            return new Response(JSON.stringify(await fn(p, c)), c as any);
          }
          : async (c: Context) => {
            c.headers.push(json);
            return new Response(JSON.stringify(await fn(c)), c as any);
          }
        : hasParam
          ? (p: any, c: Context) => {
            c.headers.push(json);
            return new Response(JSON.stringify(fn(p, c)), c as any);
          }
          : (c: Context) => {
            c.headers.push(json);
            return new Response(JSON.stringify(fn(c)), c as any);
          };
  }
};

import type { Context } from '../types/route';

const html = ['content-type', 'text/html'];
const json = ['content-type', 'application/json'];

export default {
  status: 200,
  headers: null as any as [string, string][],
  req: null as any as Request,

  send(body: any, status: any): Response {
    if (typeof status === 'number')
      this.status = status;
    return new Response(body, this);
  },

  html(body: any, status: any): Response {
    this.headers.push(<[string, string]>html);
    if (typeof status === 'number')
      this.status = status;
    return new Response(body, this);
  },

  json(body: any, status: any): Response {
    this.headers.push(<[string, string]>json);
    if (typeof status === 'number')
      this.status = status;
    return new Response(JSON.stringify(body), this);
  }
} as Context;

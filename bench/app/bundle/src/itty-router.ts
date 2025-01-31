import { IttyRouter, withParams } from 'itty-router';
import { pathMap } from '../../reqs';

const app = IttyRouter().all('*', withParams);

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];

  app.get(path.replace(/\/:\w+/g, '/*'), path.includes(':')
    ? (c) => new Response(fn(c.one))
    : () => new Response(fn())
  );
}

export const serve = app;

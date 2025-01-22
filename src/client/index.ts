import type { AnyRouter } from '..';
import type { Client } from './types';

type QueryValue = number | string | boolean;

export const stringifyQueryValue = (key: string, val: QueryValue): string => {
  switch (typeof val as 'string' | 'number' | 'boolean') {
    // eslint-disable-next-line
    case 'boolean': return val === true ? key + '&' : '';
    // eslint-disable-next-line
    case 'number': return key + '=' + val + '&';
    // eslint-disable-next-line
    case 'string': return key + '=' + encodeURIComponent(val) + '&';
  }
};

export const stringifyQuery = (query: Record<string, QueryValue | QueryValue[]>): string => {
  let str = '';
  let val: QueryValue | QueryValue[];

  for (let key in query) {
    val = query[key];
    key = encodeURIComponent(key);

    if (Array.isArray(val))
      for (let i = 0; i < val.length; i++) str += stringifyQueryValue(key, val[i]);
    else
      str += stringifyQueryValue(key, val);
  }

  // eslint-disable-next-line
  return '?' + str.slice(0, -1);
};

export const createRPCMethod = (root: string, defaultMethod: string, defaultInit: RequestInit, fetch: ClientOptions['fetch']): (path: string, init?: RequestInit & { body?: unknown, query?: unknown, params?: string[] }) => Promise<Response> => {
  if (defaultMethod !== '$')
    defaultInit.method = defaultMethod.toUpperCase();

  // eslint-disable-next-line
  return (path, init) => {
    if (init == null)
      return fetch(root + path, defaultInit);

    // Fix props
    let tmp: unknown = init.body;
    if (typeof tmp === 'object' && tmp !== null && tmp.constructor === Object)
      init.body = JSON.stringify(tmp);

    tmp = init.params;
    if (tmp != null) {
      let i = 0;
      // eslint-disable-next-line
      path = path.replace(/\*/g, () => '' + (tmp as any[])[i++]);
      // Trim last
      if (path.endsWith('*')) path = path.slice(0, -1);
    }

    tmp = init.query;
    if (tmp != null)
      path += stringifyQuery(tmp as {});

    // Finally send the request
    return fetch(root + path, { ...defaultInit, ...init });
  };
};

export interface ClientOptions {
  fetch: (path: string, init?: any) => Promise<Response>;
  init: Omit<RequestInit, 'headers'>;
}

export default <const T extends AnyRouter>(root: string, exposeMethods: (keyof Client<T>)[], options?: Partial<ClientOptions>): Client<T> => {
  // Easier path concatenation
  if (root.endsWith('/')) root = root.slice(0, -1);

  // Bind global fetch
  // eslint-disable-next-line
  const defaultFetch: ClientOptions['fetch'] = options?.fetch ?? ((a, b) => fetch(a, b));
  const defaultInit = options?.init ?? {};

  return Object.fromEntries(exposeMethods.map((m) => [m, createRPCMethod(root, m as string, { ...defaultInit }, defaultFetch)])) as any;
};

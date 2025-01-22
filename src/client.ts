import type { AnyRouter, SubrouterData } from '.';
import type { HandlerData, InferHandlerRPC } from './types/route';
import type { ConcatPath, UnionToIntersection } from './types/utils';

export type InferClient<T extends AnyRouter, Prefix extends string> = InferRoutes<T['r'], Prefix> | InferSubrouters<T['s'], Prefix>;

export type InferSubrouters<T extends SubrouterData[], Prefix extends string = ''> = T extends [infer A extends SubrouterData, ...infer Rest extends SubrouterData[]]
  ? InferClient<A[1], ConcatPath<Prefix, A[0]>> | InferSubrouters<Rest, Prefix>
  : never;

export type InferRoutes<T extends HandlerData[], Prefix extends string> = T extends [infer A extends HandlerData, ...infer Rest extends HandlerData[]]
  ? InferHandlerRPC<A, Prefix> | InferRoutes<Rest, Prefix>
  : never;

export type Client<T extends AnyRouter> = UnionToIntersection<InferClient<T, ''>>;

type QueryValue = number | string | boolean | (number | string | boolean)[];
export const stringifyQuery = (query: Record<string, QueryValue>): string => {
  let str = '';
  let val: QueryValue;

  for (let key in query) {
    val = query[key];
    // eslint-disable-next-line
    key = encodeURIComponent(key) + '=';

    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++)
        // eslint-disable-next-line
        str += key + val[i] + '&';
    } else
      // eslint-disable-next-line
      str += key + val + '&';
  }

  // eslint-disable-next-line
  return '?' + str.slice(0, -1);
};

export const createRPCMethod = (root: string, defaultMethod: string, fetch: (path: string, init?: any) => Promise<Response>): (path: string, init?: RequestInit & { body?: unknown, query?: unknown, params?: string[] }) => Promise<Response> => {
  const defaultInit = {
    method: defaultMethod === '$' ? undefined : defaultMethod
  };

  // eslint-disable-next-line
  return (path, init) => {
    if (init == null)
      return fetch(path, defaultInit);

    // Fix props
    let tmp: unknown = init.body;
    if (typeof tmp === 'object' && tmp !== null && tmp.constructor === Object)
      init.body = JSON.stringify(tmp);

    tmp = init.query;
    if (tmp != null)
      path += stringifyQuery(tmp as {});

    init.method = defaultInit.method;

    // Finally send the request
    return fetch(path, init);
  };
};

export default <const T extends AnyRouter, const Methods extends (keyof Client<T>)[]>(root: string, exposeMethods: Methods): Pick<Client<T>, Methods[number] & string> => {
  if (root.endsWith('/')) root = root.slice(0, -1);

  // @ts-expect-error All method handler
  exposeMethods.push('$');
  return Object.fromEntries(exposeMethods.map((m) => [m, createRPCMethod(root, m as string, fetch.bind(globalThis))])) as any;
};

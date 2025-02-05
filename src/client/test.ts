import client, { type ClientOptions } from '.';
import build from '../build/quick';

import type { AnyRouter } from '..';
import type { Client } from './types';

export const scanMethods = (methods: string[], router: AnyRouter): void => {
  for (const routes of router.r) {
    const method = routes[0]?.toLowerCase() ?? '$';
    if (!methods.includes(method))
      methods.push(method);
  }
  for (const subroutes of router.s) scanMethods(methods, subroutes[1]);
};

/**
 * Create a test client for a router
 */
export default <T extends AnyRouter>(router: T, options?: Partial<ClientOptions>): Client<T> => {
  const fn = build(router);
  (options ??= {}).fetch = async (a, b) => fn(new Request(a, b));

  const methods: any[] = [];
  scanMethods(methods, router);

  return client<T>('http://127.0.0.1', methods, options);
};

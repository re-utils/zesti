import client, { type ClientOptions } from '.';
import build from '../build/fast';

import type { AnyRouter } from '..';
import type { Client } from './types';

export const searchMethods = (methods: string[], router: AnyRouter): void => {
  for (const routes of router.r) methods.push(routes[0]?.toLowerCase() ?? '$');
  for (const subroutes of router.s) searchMethods(methods, subroutes[1]);
};

/**
 * Create a test client for a router
 */
export default <T extends AnyRouter>(router: T, options?: Partial<ClientOptions>): Client<T> => {
  const fn = build(router);
  (options ??= {}).fetch = async (a, b) => fn(new Request(a, b));

  const methods: any[] = [];
  searchMethods(methods, router);

  return client<T>('http://127.0.0.1:3000', methods, options);
};

import type { MiddlewareFn } from '..';
import type { Context } from '../types/route';
import { invalidBodyFormat } from './error';

/**
 * A lighter alternative to a middleware
 */
export const createValidator = <T>(
  assert: (o: any) => o is T
): (c: Context) => Promise<T | undefined> => async (c) => {
  // eslint-disable-next-line
  const body = await c.req.json().catch(() => { });
  if (assert(body)) return body;
};

/**
 * Create a validator middleware
 */
export default <T>(
  assert: (o: any) => o is T
): MiddlewareFn<{ body: T }> => async (next, c) => {
  // eslint-disable-next-line
  const body = await c.req.json().catch(() => { });
  if (assert(body)) {
    c.body = body;
    return next();
  }

  return next(invalidBodyFormat);
};

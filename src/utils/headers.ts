import type { MiddlewareFn } from '..';

export default (headers: HeadersInit): MiddlewareFn => {
  if (!Array.isArray(headers)) {
    headers = headers instanceof Headers
      ? headers.entries().toArray()
      : Object.entries(headers);
  }

  // Optimization
  if (headers.length === 1) {
    headers = headers[0] as any;

    // eslint-disable-next-line
    return (next, c) => {
      c.headers.push(headers as any);
      return next();
    };
  }

  // eslint-disable-next-line
  return (next, c) => {
    c.headers.push(...headers);
    return next();
  };
};

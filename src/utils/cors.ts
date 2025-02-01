import type { MiddlewareFn } from '..';

type HeaderValue = '*' | (string & {}) | [string, string, ...string[]];

export interface Options {
  allowHeaders?: HeaderValue;
  allowMethods?: HeaderValue;
  exposeHeaders?: HeaderValue;
  maxAge?: number;
  allowCredentials?: boolean;
}

export default (origins: HeaderValue, options?: Options): MiddlewareFn => {
  // Optimized for code size
  const headers: [string, string][] = options == null
    ? []
    : Object.entries(options).map(([x, y]) => [
      // eslint-disable-next-line
      'Access-Control-' + x[0].toUpperCase() + x.slice(1).replace(/([a-z])([A-Z])/g, '$1-$2'),
      // eslint-disable-next-line
      '' + y
    ]);

  // When one specific or multiple origins are specified
  if (origins !== '*') {
    headers.push(['Vary', 'Origin']);

    // Handle multiple origins
    if (Array.isArray(origins)) {
      // eslint-disable-next-line
      return (next, c) => {
        const url = c.req.url;

        const origin = url.substring(0, url.indexOf('/', 12));
        c.headers.push(['Access-Control-Allow-Origin', origins.includes(origin) ? origin : origins[0]], ...headers);

        return next();
      };
    }
  }

  // Decide right away
  headers.push(['Access-Control-Allow-Origin', origins]);

  // Simple headers
  // eslint-disable-next-line
  return (next, c) => {
    c.headers.push(...headers);
    return next();
  };
};

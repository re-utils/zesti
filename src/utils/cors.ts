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
  const headers: [string, string][] = [];
  const preflightHeaders: [string, string][] = [];

  if (options != null) {
    if (options.allowHeaders != null)
      // eslint-disable-next-line
      preflightHeaders.push(['Access-Control-Allow-Headers', '' + options.allowHeaders]);
    if (options.allowMethods != null)
      // eslint-disable-next-line
      preflightHeaders.push(['Access-Control-Allow-Methods', '' + options.allowMethods]);
    if (options.maxAge != null)

      preflightHeaders.push(['Access-Control-Max-Age', '' + options.maxAge]);

    if (options.exposeHeaders != null)
      // eslint-disable-next-line
      headers.push(['Access-Control-Expose-Headers', '' + options.exposeHeaders]);
    if (options.allowCredentials === true)
      headers.push(['Access-Control-Allow-Credentials', 'true']);
  }

  // When one specific or multiple origins are specified
  if (origins !== '*') {
    headers.push(['Vary', 'Origin']);

    // Handle multiple origins
    if (Array.isArray(origins)) {
      // Skip when not needed
      return (next, c) => {
        const origin = c.req.headers.get('Origin');
        c.headers.push(['Access-Control-Allow-Origin', typeof origin === 'string' && origins.includes(origin) ? origin : origins[0]], ...headers);

        if (c.req.method === 'OPTIONS')
          c.headers.push(...preflightHeaders);

        return next();
      };
    }
  }

  headers.push(['Access-Control-Allow-Origin', origins]);

  return (next, c) => {
    c.headers.push(...headers);

    if (c.req.method === 'OPTIONS')
      c.headers.push(...preflightHeaders);

    return next();
  };
};

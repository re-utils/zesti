export type MaybePromise<T> = T extends Promise<any> ? T : Promise<T> | T;
export type Prettify<T> = Omit<T, never>;
export type AnyFn = (...a: any[]) => any;
export type FetchFn = (req: Request, ...args: any[]) => MaybePromise<Response>;

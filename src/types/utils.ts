export type MaybePromise<T> = T extends Promise<any> ? T : Promise<T> | T;
export type AwaitedReturn<T> = Awaited<T extends (...args: any[]) => any ? ReturnType<T> : unknown>;
export type Prettify<T> = Omit<T, never>;
export type PickIfExists<T, K extends string | number | symbol> = { [P in K & keyof T]: T[P] };
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never;
export type ConcatPath<Prefix extends string, Path extends string> = Prefix extends '/' ? Path : `${Prefix}${Path}`;
export type AnyFn = (...a: any[]) => any;

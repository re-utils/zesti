// eslint-disable-next-line
const AsyncFunction = (async () => { }).constructor;
export const isAsync = (t: any): t is (...args: any[]) => Promise<any> => t instanceof AsyncFunction;

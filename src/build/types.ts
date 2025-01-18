import type { AnyRouter } from '..';
import type { FetchFn } from '../types/utils';

export type BuildFn = (router: AnyRouter) => FetchFn;

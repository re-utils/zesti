import { dynamicError, staticError, type DynamicError, type StaticError } from '../error';

/**
 * A generic error for invalid body format
 */
export const invalidBodyFormat: StaticError = staticError();

/**
 * A detailed invalid body error
 */
export const invalidBody: DynamicError<string> = dynamicError();

/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ValidationFn } from 'workit-types';

/**
 * Determines if the given hex string is truely a hex value. False if value is
 * null.
 * @param value
 */
const isHex: ValidationFn = (value: string): boolean => {
  return typeof value === 'string' && /^[0-9A-F]*$/i.test(value);
};

/**
 * Determines if the given hex string is all zeros. False if value is null.
 * @param value
 */
const isNotAllZeros: ValidationFn = (value: string): boolean => {
  return typeof value === 'string' && !/^[0]*$/i.test(value);
};

/**
 * Determines if the given hex string is of the given length. False if value is
 * null.
 * @param value
 */
const isLength = (length: number): ValidationFn => {
  return (value: string): boolean => {
    return typeof value === 'string' && value.length === length;
  };
};

/**
 * Compose a set of validation functions into a single validation call.
 */
const compose = (...fns: ValidationFn[]): ValidationFn => {
  return (value: string) => {
    return fns.reduce((isValid, fn) => isValid && fn(value), true);
  };
};

/**
 * Determines if the given traceId is valid based on section 2.2.2.1 of the
 * Trace Context spec.
 */
export const isValidTraceId = compose(isHex, isNotAllZeros, isLength(32));

/**
 * Determines if the given spanId is valid based on section 2.2.2.2 of the Trace
 * Context spec.
 */
export const isValidSpanId = compose(isHex, isNotAllZeros, isLength(16));

/**
 * Determines if the given option is valid based on section 2.2.3 of the Trace
 * Context spec.
 */
export const isValidOption = compose(isHex, isLength(2));

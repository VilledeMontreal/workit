/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export const isFunction = (f: any) => typeof f === 'function';
export const isObject = (o: any) => typeof o === 'object';
/**
 * Applied test function on each element on the array and ANDs the results
 */
export const andArrayWith = <T = unknown>(arr: T[], test: (param: T) => boolean) =>
  arr.reduce((bool, current) => bool && test(current), true);
/**
 * Checks if parameter is an array of functions
 */
export const isArrayOfFunctions = (a: any): boolean => Array.isArray(a) && a.length > 0 && andArrayWith(a, isFunction);
export const isEmptyArray = (a: any): boolean => Array.isArray(a) && a.length === 0;

export function parseCommaSeparatedBaggage(baggage: any, values: string): void {
  values.split(',').forEach((keyVal) => {
    const splitKeyVal: string[] = keyVal.trim().split('=');
    if (splitKeyVal.length === 2) {
      const [key, val] = splitKeyVal;
      // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-member-access
      baggage[key] = val;
    }
  });
}

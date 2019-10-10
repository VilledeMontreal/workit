/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage, IWorkflowProps } from 'workit-types';
import { ProxyFactory } from '../models/core/proxyFactory';

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
/**
 * Checks if parameter is a primitive value
 */
export const isPrimitive = (value: any) => value === null || (typeof value !== 'object' && typeof value !== 'function');
export const concatPath = (path: string, property: any) => {
  let clonePath = path;
  if (property && property.toString) {
    if (path) {
      clonePath += '.';
    }

    clonePath += property.toString();
  }

  return clonePath;
};

export const getVariablesWhenChanged = <T = any>(
  message: IMessage<unknown, IWorkflowProps<unknown>>,
  unwrap: (message: IMessage<unknown, IWorkflowProps<unknown>>) => T
): T | undefined => {
  let vars: T | undefined;
  if ((message && !(message as any).__proxy__) || ProxyFactory.cacheChanges.has(message)) {
    vars = unwrap(message);
  }
  return vars;
};

export function parseCommaSeparatedBaggage(baggage: any, values: string): void {
  values.split(',').forEach(keyVal => {
    const splitKeyVal: string[] = keyVal.trim().split('=');
    if (splitKeyVal.length === 2) {
      baggage[splitKeyVal[0]] = splitKeyVal[1];
    }
  });
}

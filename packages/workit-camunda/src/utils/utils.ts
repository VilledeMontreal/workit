import { Span } from 'opentracing';
import { IMessage } from '../models/camunda-n-mq/specs/message';
import { ProxyFactory } from '../models/core/proxyFactory';

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
export const isFunction = (f: any) => typeof f === 'function';
export const isObject = (o: any) => typeof o === 'object';
/**
 * Applied test function on each element on the array and ANDs the results
 */
export const andArrayWith = <T = any>(arr: T[], test: (param: T) => boolean) =>
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
  message: IMessage,
  unwrap: (message: IMessage) => T
): T | undefined => {
  let vars: T | undefined;
  if (!(message as any).__proxy__ || ProxyFactory.cacheChanges.has(message)) {
    vars = unwrap(message);
  }
  return vars;
};

export const isSpan = (obj: any): obj is Span => {
  return obj && isFunction(obj.context) && isFunction(obj.finish) && isFunction(obj.tracer);
};

export function parseCommaSeparatedBaggage(baggage: any, values: string): void {
  values.split(',').forEach(keyVal => {
    const splitKeyVal: string[] = keyVal.trim().split('=');
    if (splitKeyVal.length === 2) {
      baggage[splitKeyVal[0]] = splitKeyVal[1];
    }
  });
}

/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage, Interceptor } from '@villedemontreal/workit-types';
import { ProxyFactory } from './proxyFactory';
import { isArrayOfFunctions, isEmptyArray, isFunction, isObject } from './utils/utils';

export class Interceptors {
  public static sanitize = (interceptors: Interceptor | Interceptor[] | undefined): Interceptor[] | undefined => {
    if (!interceptors || isEmptyArray(interceptors)) {
      return undefined;
    }

    const isInterceptor = isFunction(interceptors);
    if (!isInterceptor && !isArrayOfFunctions(interceptors)) {
      throw new Error('interceptors passed in parameter are not valid.');
    }

    if (isInterceptor) {
      return [interceptors] as Interceptor[];
    }

    return interceptors as Interceptor[];
  };

  /**
   * It will execute all interceptors concurrently (limited by INTERCEPTOR_ASYNC_LIMIT env, default 3)
   * body message will be untouched
   * properties will be merged from all returned messages
   */
  public static async execute<T extends IMessage>(
    interceptors: Interceptor | Interceptor[] | undefined,
    message: T
  ): Promise<T> {
    const interceptorsSanitized = Interceptors.sanitize(interceptors);
    if (!interceptorsSanitized) {
      return message;
    }
    return Interceptors._internalExecute(interceptorsSanitized, message);
  }

  private static async _internalExecute<T extends IMessage>(interceptors: Interceptor[], message: T): Promise<T> {
    let msg = message;
    // eslint-disable-next-line no-restricted-syntax
    for (const interceptor of interceptors) {
      msg = await interceptor(msg);
    }
    Interceptors._validateMessage(msg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!(msg as any).__proxy__ || ProxyFactory.cacheChanges.has(msg)) {
      ProxyFactory.cacheChanges.set(msg, true);
      return ProxyFactory.create(msg);
    }
    return msg;
  }

  private static _validateMessage<T extends IMessage>(msg: T) {
    // light validation, perhaps we should check properties
    const isObj = isObject(msg);
    if (!isObj || !isObject(msg.body) || !isObject(msg.properties)) {
      throw Error(`interceptor must return IMessage object`);
    }
  }
}

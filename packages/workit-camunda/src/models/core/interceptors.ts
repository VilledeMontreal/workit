/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { isArrayOfFunctions, isEmptyArray, isFunction, isObject } from '../../utils/utils';
import { IMessage } from '../camunda-n-mq/specs/message';
import { ProxyFactory } from './proxyFactory';
import { Interceptor } from './specs/interceptor';

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
  public static async execute(
    interceptors: Interceptor | Interceptor[] | undefined,
    message: IMessage
  ): Promise<IMessage> {
    const interceptorsSanitized = Interceptors.sanitize(interceptors);
    if (!interceptorsSanitized) {
      return message;
    }
    return Interceptors.internalExecute(interceptorsSanitized, message);
  }

  private static async internalExecute(interceptors: Interceptor[], message: IMessage): Promise<IMessage> {
    let msg = message;
    for (const interceptor of interceptors) {
      msg = await interceptor(msg);
    }
    Interceptors.validateMessage(msg);
    if (!(msg as any).__proxy__ || ProxyFactory.cacheChanges.has(msg)) {
      ProxyFactory.cacheChanges.set(msg, true);
      return ProxyFactory.create(msg);
    }
    return msg;
  }

  private static validateMessage(msg: IMessage) {
    // light validation, perhaps we should check properties
    const isObj = isObject(msg);
    if (!isObj || !isObject(msg.body) || !isObject(msg.properties)) {
      throw Error(`interceptor must return IMessage object`);
    }
  }
}

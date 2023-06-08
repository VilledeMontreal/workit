/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ProxyObserver } from './proxyObserver';
// eslint-disable-next-line import/order
import debug = require('debug');

const log = debug('workit:proxy');
/**
 * Factory for creating a ProxyObserver instance with default handler when object given change
 *
 */
export class ProxyFactory {
  public static readonly cacheChanges = new WeakMap();

  /**
   * Create a ProxyObserver instance with default handler.
   * You can check with ProxyFactory.cacheChanges.has(obj) that return a boolean if object has changed.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static create<T extends object = any>(object: T): T {
    return new ProxyObserver(object, function (path, value, previousValue) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      log(`message change. Previous value ${previousValue}, new value ${String(value)} on ${path}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      ProxyFactory.cacheChanges.set(this._proxy, true);
    }) as T;
  }
}

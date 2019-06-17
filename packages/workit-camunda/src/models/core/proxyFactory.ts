import debug = require('debug');
import { ProxyObserver } from './proxyObserver';

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
  public static create<T extends object = any>(object: T): T {
    return new ProxyObserver(object, function(path, value, previousValue) {
      log(`message change. Previous value ${previousValue}, new value ${value} on ${path}`);
      ProxyFactory.cacheChanges.set(this._proxy, true);
    }) as T;
  }
}

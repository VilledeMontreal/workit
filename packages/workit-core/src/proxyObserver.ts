/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { concatPath, isPrimitive } from './utils/utils';

const proxyTarget = Symbol('ProxyTarget');

/**
 * It's for observing an object. In this package,
 * it's mainly for observing variables provided by the Camunda Platform
 * This class could be a package itself. Because it can be reused
 */
export class ProxyObserver {
  private _inApply = false;
  private _changed = false;
  private readonly _propCache = new WeakMap();
  private readonly _pathCache = new WeakMap();
  private readonly _proxy;
  private onChange: (proxy: any, property: any, value: any, previous?: any) => void;
  private handler = {
    get: (target: object, property: string | number | symbol, receiver: any) => {
      if (property === proxyTarget) {
        return target;
      }

      const value = Reflect.get(target, property, receiver);
      if (isPrimitive(value) || property === 'constructor') {
        return value;
      }

      if (target instanceof Date) {
        return target[property].bind(target);
      }

      // Preserve invariants
      const descriptor = this.getOwnPropertyDescriptor(target, property);
      // TODO: improve if if if
      if (descriptor && !descriptor.configurable) {
        if (descriptor.set && !descriptor.get) {
          return undefined;
        }

        if (descriptor.writable === false) {
          return value;
        }
      }

      this._pathCache.set(value, concatPath(this._pathCache.get(target), property));
      return new Proxy(value, this.handler);
    },

    set: (target: object, property: string | number | symbol, value: any, receiver: any) => {
      let val = value;
      if (val && val[proxyTarget] !== undefined) {
        val = val[proxyTarget];
      }

      const previous = Reflect.get(target, property, receiver);
      const result = Reflect.set(target, property, value);

      if (previous !== value) {
        this.handleChange(this._pathCache.get(target), property, previous, value);
      }

      return result;
    },

    defineProperty: (target: object, property: string | number | symbol, descriptor: PropertyDescriptor) => {
      const result = Reflect.defineProperty(target, property, descriptor);
      this.invalidateCachedDescriptor(target, property);

      this.handleChange(this._pathCache.get(target), property, undefined, descriptor.value);

      return result;
    },

    deleteProperty: (target: object, property: string | number | symbol) => {
      const previous = Reflect.get(target, property);
      const result = Reflect.deleteProperty(target, property);
      this.invalidateCachedDescriptor(target, property);

      this.handleChange(this._pathCache.get(target), property, previous);

      return result;
    },

    apply: (target: any, thisArg: any, argumentsList: ArrayLike<any>) => {
      if (!this._inApply) {
        this._inApply = true;

        const result = Reflect.apply(target, thisArg, argumentsList);

        if (this._changed) {
          this.onChange(null, null, null, null);
        }

        this._inApply = false;
        this._changed = false;

        return result;
      }

      return Reflect.apply(target, thisArg, argumentsList);
    }
  };
  constructor(object: any, onChangeFunc: (proxy: any, property: any, value: any, previous: any) => void) {
    this.onChange = onChangeFunc;
    this._pathCache.set(object, '');
    Object.defineProperty(object, '__proxy__', {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false
    });
    this._proxy = new Proxy(object, this.handler);
    return this._proxy;
  }
  private handleChange = (path: string, property: any, previous: any, value?: any) => {
    if (!this._inApply) {
      this.onChange(this._proxy, concatPath(path, property), value, previous);
    } else if (!this._changed) {
      this._changed = true;
    }
  };
  private getOwnPropertyDescriptor = (target: object, property: string | number | symbol) => {
    let props = this._propCache.get(target);

    if (props) {
      return props;
    }

    props = new Map();
    this._propCache.set(target, props);

    let prop = props.get(property);
    if (!prop) {
      prop = Reflect.getOwnPropertyDescriptor(target, property);
      props.set(property, prop);
    }

    return prop;
  };
  private invalidateCachedDescriptor = (target: object, property: any) => {
    const props = this._propCache.get(target);

    if (props) {
      props.delete(property);
    }
  };
}

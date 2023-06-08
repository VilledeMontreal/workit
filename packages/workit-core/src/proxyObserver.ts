/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { isPrimitive } from './utils/isPrimitive';
import { concatPath } from './utils/concat';

const proxyTarget = Symbol('ProxyTarget');
/* eslint @typescript-eslint/restrict-template-expressions: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
/* eslint @typescript-eslint/ban-types: 0 */
/* eslint @typescript-eslint/no-unsafe-argument: 0 */

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

  private _onChange: (proxy: any, property: any, value: any, previous?: any) => void;

  private _handler = {
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
      const descriptor = this._getOwnPropertyDescriptor(target, property);
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
      return new Proxy(value, this._handler);
    },

    set: (target: object, property: string | number | symbol, value: any, receiver: any) => {
      let val = value;
      if (val && val[proxyTarget] !== undefined) {
        val = val[proxyTarget];
      }

      const previous = Reflect.get(target, property, receiver);
      const result = Reflect.set(target, property, value);

      if (previous !== value) {
        this._handleChange(this._pathCache.get(target), property, previous, value);
      }

      return result;
    },

    defineProperty: (target: object, property: string | number | symbol, descriptor: PropertyDescriptor) => {
      const result = Reflect.defineProperty(target, property, descriptor);
      this._invalidateCachedDescriptor(target, property);

      this._handleChange(this._pathCache.get(target), property, undefined, descriptor.value);

      return result;
    },

    deleteProperty: (target: object, property: string | number | symbol) => {
      const previous = Reflect.get(target, property);
      const result = Reflect.deleteProperty(target, property);
      this._invalidateCachedDescriptor(target, property);

      this._handleChange(this._pathCache.get(target), property, previous);

      return result;
    },

    apply: (target: Function, thisArg: any, argumentsList: ArrayLike<any>) => {
      if (!this._inApply) {
        this._inApply = true;

        const result = Reflect.apply(target, thisArg, argumentsList);

        if (this._changed) {
          this._onChange(null, null, null, null);
        }

        this._inApply = false;
        this._changed = false;

        return result;
      }

      return Reflect.apply(target, thisArg, argumentsList);
    },
  };

  constructor(
    object: object,
    onChangeFunc: (proxy: any, property: string | number | symbol, value: any, previous: any) => void
  ) {
    this._onChange = onChangeFunc;
    this._pathCache.set(object, '');
    Object.defineProperty(object, '__proxy__', {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this._proxy = new Proxy(object, this._handler);
    return this._proxy;
  }

  private _handleChange = (path: string, property: string | number | symbol, previous: any, value?: any) => {
    if (!this._inApply) {
      this._onChange(this._proxy, concatPath(path, property), value, previous);
    } else if (!this._changed) {
      this._changed = true;
    }
  };

  private _getOwnPropertyDescriptor = (target: object, property: string | number | symbol) => {
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

  private _invalidateCachedDescriptor = (target: object, property: any) => {
    const props = this._propCache.get(target);

    if (props) {
      props.delete(property);
    }
  };
}

/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/ban-types: 0 */
/* eslint @typescript-eslint/restrict-template-expressions: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */

import { IoC } from '@villedemontreal/workit-core';
import { ICamundaConfig, IReadOnlyVariables, IVariables } from '@villedemontreal/workit-types';
import { BasicAuthInterceptor } from 'camunda-external-task-client-js';
import { SERVICE_IDENTIFIER } from '../config/constants/identifiers';
import { Variables } from '../variables';

const GLOBAL_TIMEOUT_PULL = 60000;
const CONSTANTS_INTEGER_VALUE = 2 ** 31;

/**
 * Checks if parameter is undefined or null
 */
const isUndefinedOrNull = (a: unknown) => typeof a === 'undefined' || a === null;
const typeMatchers = {
  null: isUndefinedOrNull,

  /**
   * @returns {boolean} true if value is Integer
   */
  integer(a: number) {
    return Number.isInteger(a) && a >= -CONSTANTS_INTEGER_VALUE && a <= CONSTANTS_INTEGER_VALUE - 1;
  },

  /**
   * @returns {boolean} true if value is Long
   */
  long(a: number) {
    return Number.isInteger(a) && !typeMatchers.integer(a);
  },

  /**
   * @returns {boolean} true if value is Double
   */
  double(a: number) {
    return typeof a === 'number' && !Number.isInteger(a);
  },

  /**
   * @returns {boolean} true if value is Boolean
   */
  boolean(a: unknown): a is boolean {
    return typeof a === 'boolean';
  },

  /**
   * @returns {boolean} true if value is String
   */
  string(a: unknown): a is string {
    return typeof a === 'string';
  },

  /**
   * @returns {boolean} true if value is File
   */
  // file(a) {
  //   return a instanceof File;
  // },

  /**
   * @returns {boolean} true if value is Date.
   *
   */
  date(a: unknown) {
    return a instanceof Date;
  },

  /**
   * @returns {boolean} true if value is JSON
   */
  json(a: unknown) {
    return typeof a === 'object';
  },
};

export class Utils {
  public static assign(target: IVariables, object: any): IVariables {
    Object.entries(object).forEach((keyVal) => target.set(keyVal[0], keyVal[1]));
    return target;
  }

  /**
   * Not a deep copy
   */
  public static copyVariables(variables: IVariables | IReadOnlyVariables): IVariables {
    return Utils.assign(new Variables(), variables.getAll());
  }

  /**
   * Helper for building config with default settings
   *
   * @static
   * @param {ICamundaConfig} [config]
   * @returns {ICamundaConfig}
   * @memberof Utils
   */
  public static buildConfig(config?: ICamundaConfig): ICamundaConfig {
    return {
      maxTasks: 1,
      baseUrl: 'http://localhost:8080/engine-rest',
      workerId: `worker-${ config ? config.topicName : 'demo' }`,
      interceptors: Utils.defaultInterceptors(),
      use: Utils.getLogger(),
      topicName: 'topic_demo',
      ...config,
    };
  }

  public static serializeVariable({
    typedValue,
  }: {
    typedValue: { value?: any; type: string; valueInfo?: unknown;[custom: string]: any };
  }) {
    let { value, type } = { ...typedValue };

    type = type.toLowerCase();

    if (type === 'json' && typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    if (type === 'date' && value instanceof Date) {
      value = value.toISOString().replace(/Z$/, 'UTC+00:00');
    }

    return { ...typedValue, value, type };
  }

  /*
   * @returns the type of the variable
   * @param variable: external task variable
   */
  public static getVariableType = (variable: number) => {
    const match = Object.entries(typeMatchers).filter(([, matcherFunction]) => matcherFunction(variable))[0];

    return match[0];
  };

  public static serializeVariables<T = any>(
    variables: T,
    local = false
  ):
    | { [custom: string]: { type: string; value?: string | number | boolean; valueInfo: {}; local: boolean } }
    | undefined {
    if (!variables) {
      return undefined;
    }
    const dirtyVariables = {};
    Object.entries(variables).forEach(([key, value]) => {
      const type = Utils.getVariableType(value);
      const typedValue = { type, value, valueInfo: {}, local };
      dirtyVariables[key] = Utils.serializeVariable({ typedValue });
    });
    return dirtyVariables;
  }

  public static defaultInterceptors() {
    const interceptors: any = [];
    try {
      const basicOauth = IoC.get<any>(SERVICE_IDENTIFIER.camunda_oauth_info);
      interceptors.push(new BasicAuthInterceptor(basicOauth));
    } catch (error) {
      //
    }
    // add default timeout for polling
    interceptors.push((config: any) => ({ timeout: GLOBAL_TIMEOUT_PULL, ...config }));
    return interceptors;
  }

  public static getLogger(): Function | Function[] | undefined {
    try {
      return IoC.get(SERVICE_IDENTIFIER.logger, process.env.NODE_ENV);
    } catch (error) {
      return IoC.get(SERVICE_IDENTIFIER.logger);
    }
  }
}

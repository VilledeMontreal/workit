/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Variables } from 'camunda-external-task-client-js';

export { Variables };

export interface IVariables extends IReadOnlyVariables {
  set(key: string, value: any): void;
}

export interface IReadOnlyVariables<T = any> {
  get<K = any>(key: keyof T): K;
  getAll(): T;
  [custom: string]: any;
}

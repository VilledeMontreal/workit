/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IPlugins } from '../plugin';
import { ISubscriptionOptions } from './subscriptionOptions';

export interface ICamundaConfig {
  /**
   * Path to the engine api
   */
  baseUrl: string;
  /**
   * The id of the worker on which behalf tasks are fetched. The returned tasks are locked for that worker and can only be completed when providing the same worker id.
   */
  workerId: string;

  /**
   * topic name for which external tasks should be fetched
   */
  topicName: string;
  /**
   * Options about subscription
   * Like filtering what Camunda will send to the worker
   */
  subscriptionOptions?: ISubscriptionOptions;
  /**
   * The default duration to lock the external tasks for in milliseconds.
   */
  lockDuration?: number;
  /**
   * Interval of time to wait before making a new poll.
   *
   */
  interval?: number;
  /**
   * Function(s) that have access to the client instance as soon as it is created and before any polling happens. Check out logger for a better understanding of the usage of middlewares.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  use?: Function | Function[];
  bpmnKey?: string;
  autoPoll?: boolean;
  /**
   * The maximum number of tasks to fetch
   */
  maxTasks?: number;
  /**
   * The Long Polling timeout in milliseconds.
   */
  asyncResponseTimeout?: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  interceptors?: Function | Function[];
  /** load librairies containing workflow tasks */
  plugins?: IPlugins;
}

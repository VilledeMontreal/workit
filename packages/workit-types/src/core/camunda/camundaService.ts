/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '../message';
import { FailureException } from './failureException';

export interface ICamundaService {
  hasBeenThreated: boolean;
  /** Complete the task with a success */
  ack(message: IMessage): Promise<void>;

  /**
   * Fail the task with an informative message as to the cause. Optionally pass in a value remaining retries.
   * Pass in 0 for retries to raise an incident
   */
  nack(e: FailureException): Promise<void>;
}

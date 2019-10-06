/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '../message';
import { FailureException } from './failureException';

export interface ICamundaService {
  hasBeenThreated: boolean;
  ack(message: IMessage): Promise<void>;
  nack(e: FailureException): Promise<void>;
}

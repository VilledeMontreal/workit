// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { FailureException } from './failureException';
import { IMessage } from './message';

export interface ICamundaService {
  hasBeenThreated: boolean;
  ack(message: IMessage): Promise<void>;
  nack(e: FailureException): Promise<void>;
}

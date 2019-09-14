/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ICamundaService } from '../../camunda-n-mq/specs/camundaService';
import { IMessage } from '../../camunda-n-mq/specs/message';

export interface IFailureStrategy {
  handle(error: any, message: IMessage, service: ICamundaService): Promise<void>;
}

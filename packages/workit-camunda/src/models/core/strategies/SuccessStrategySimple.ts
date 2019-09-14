/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { injectable } from 'inversify';
import 'reflect-metadata';
import { ICamundaService } from '../../camunda-n-mq/specs/camundaService';
import { IMessage } from '../../camunda-n-mq/specs/message';
import { ISuccessStrategy } from '../specs/successStrategy';

@injectable()
export class SuccessStrategySimple implements ISuccessStrategy {
  public handle(message: IMessage, service: ICamundaService): Promise<void> {
    return service.ack(message);
  }
}

/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { injectable } from 'inversify';
import 'reflect-metadata';
import { ICamundaService, IMessage, ISuccessStrategy } from 'workit-types';

@injectable()
export class SuccessStrategySimple implements ISuccessStrategy<ICamundaService> {
  public handle(message: IMessage, service: ICamundaService): Promise<void> {
    return service.ack(message);
  }
}

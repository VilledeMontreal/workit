/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ICamundaService, IMessage, ISuccessStrategy } from '@villedemontreal/workit-types';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class SuccessStrategySimple implements ISuccessStrategy<ICamundaService> {
  public handle(message: IMessage, service: ICamundaService): Promise<void> {
    return service.ack(message);
  }
}

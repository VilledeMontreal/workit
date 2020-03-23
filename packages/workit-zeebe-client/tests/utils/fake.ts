/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { TaskBase } from 'workit-core';
import { ICamundaService, IMessage } from 'workit-types';

export class FakeTask extends TaskBase<IMessage> {
  public execute(model: IMessage): Promise<IMessage> {
    return Promise.resolve(model);
  }
}

export class FakeClient {
  public subscribe(onMessageReceived: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void> {
    return Promise.resolve();
  }

  public unsubscribe(): Promise<void> {
    return Promise.resolve();
  }
}

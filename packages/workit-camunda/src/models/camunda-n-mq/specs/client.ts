// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { ICamundaService } from './camundaService';
import { IMessage } from './message';

export interface IClient {
  subscribe(onMessageReceived: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void>;
  unsubscribe(): Promise<void>;
}

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IVariablePayload } from './payload';
import { ITopicSubscription } from './topicSubscription';

export interface ICamundaClient {
  executeTask(task: IVariablePayload): void;
  poll(): void;
  sanitizeOptions(customOptions: any): void;
  start(): void;
  stop(): void;
  subscribe(topic: string, handler: (obj: { task: IVariablePayload; taskService: any }) => void): ITopicSubscription;
  subscribe(topic: string, customOptions: any, handler: (obj: any) => void): ITopicSubscription;
}

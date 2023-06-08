/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from './message';

export interface IClient<T = unknown> {
  subscribe(onMessageReceived: (message: IMessage, service: T) => Promise<void>): Promise<void>;
  unsubscribe(): Promise<void>;
}

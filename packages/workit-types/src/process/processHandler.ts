/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '../core/message';

export interface IProcessHandler {
  on(event: 'message-handled', listener: (e: Error, message: IMessage) => void): this;
  on(event: 'message', listener: (message: IMessage) => void): this;
  handle(...args: any[]): Promise<void>;
}

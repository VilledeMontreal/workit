/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from './message';

export interface ISuccessStrategy<T = unknown> {
  handle(message: IMessage, service: T): Promise<void>;
}

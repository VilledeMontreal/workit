/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from './message';

export interface IFailureStrategy<T = unknown> {
  handle(error: any, message: IMessage, service: T): Promise<void>;
}

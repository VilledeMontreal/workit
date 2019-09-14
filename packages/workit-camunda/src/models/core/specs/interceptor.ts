/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '../../camunda-n-mq/specs/message';
/**
 * When we receive a payload from the client, we execute all interceptors.
 * Those interceptors return IMessage that is merged (Shallow copy for body and customHeaders).
 * This payload is passed to the task bound to the IoC.
 */
export type Interceptor = (message: IMessage) => Promise<IMessage>;

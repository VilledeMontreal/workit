/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Interceptor } from '../core/interceptor';
import { ITracerPropagator } from '../tracer/tracerPropagator';

export interface IProcessHandlerConfig {
  /**
   * When we receive a payload from the client, we execute all interceptors.
   * Those interceptors return IMessage that is merged (Shallow copy for body and customHeaders).
   * This payload is passed to the task (bound to the IoC).
   */
  interceptors?: Interceptor | Interceptor[];
  /**
   * Used for extracting traceId from message
   */
  propagation?: ITracerPropagator;
}

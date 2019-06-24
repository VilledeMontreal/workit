// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IMessageBase } from '../../../camunda-n-mq/specs/message';
import { ICamundaClientInstrumentation } from './camundaClientInstrumentation';

export interface ICamundaClientTracer extends ICamundaClientInstrumentation {
  createRootSpanOnMessage<TBody = any, TProps = any>(payload: IMessageBase<TBody, TProps>);
}

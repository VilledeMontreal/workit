// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IMessage } from '../../../camunda-n-mq/specs/message';

export interface ICamundaClientInstrumentation {
  kind: string;
  onMessageFailed(e: Error, message: IMessage): void;
  onMessageSuccess(message: IMessage): void;
}

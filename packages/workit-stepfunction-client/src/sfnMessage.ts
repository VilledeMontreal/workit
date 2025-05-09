/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */

import { FailureException, ICamundaService, IMessage, IWorkflowProps } from '@villedemontreal/workit-types';
import { Message } from '@aws-sdk/client-sqs';
import { StepFunctionRepository } from './repositories/stepFunctionRepository';
import { SfnSqsMapperProperties } from './sfnSqsMapperProperties';
import { dateTimeReviver } from './utils/datetime';
import { DISABLE_DATETIME_REVIVER } from './config/constants/params';

export class SfnMessage {
  public static wrap(payload: Message, repo: StepFunctionRepository): [IMessage, ICamundaService] {
    const { Body } = payload;
    const msg: IMessage =
      (!DISABLE_DATETIME_REVIVER
        ? JSON.parse(Body || '{}', dateTimeReviver)
        : (JSON.parse(Body || '{}') as IMessage)) || Object.create(null);

    const properties = SfnSqsMapperProperties.map({ ...payload, Body: msg });
    const messageWithoutSpan = { body: msg.body, properties };
    return [
      messageWithoutSpan,
      {
        hasBeenThreated: false,
        /**
         * Acknowledge the message to Step functions platform
         */
        async ack(
          message: IMessage<{ [s: string]: unknown }, IWorkflowProps<{ [s: string]: string | number | boolean }>>,
        ) {
          if (this.hasBeenThreated) {
            return Promise.resolve();
          }

          await repo.sendTaskSuccess(message);
          this.hasBeenThreated = true;
        },
        /**
         * Un acknowledge the message to Step functions platform
         * This will handle failure.
         */
        async nack(error: FailureException) {
          if (this.hasBeenThreated) {
            return Promise.resolve();
          }

          await repo.sendTaskFailure(error, messageWithoutSpan);
          this.hasBeenThreated = true;
        },
      },
    ];
  }
}

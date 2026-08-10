/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
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
    const treatmentState = { hasBeenThreated: false };
    let treatmentInFlight: Promise<void> | undefined;
    const runTreatment = async (treatment: () => Promise<void>): Promise<void> => {
      if (treatmentState.hasBeenThreated) {
        return;
      }
      if (treatmentInFlight) {
        const currentTreatment = treatmentInFlight;
        try {
          await currentTreatment;
          return;
        } catch (error) {
          if (treatmentInFlight === currentTreatment) {
            treatmentInFlight = undefined;
          }
          if (!treatmentState.hasBeenThreated) {
            await runTreatment(treatment);
            return;
          }
          throw error;
        }
      }

      const currentTreatment = (async () => {
        await treatment();
        treatmentState.hasBeenThreated = true;
      })();
      treatmentInFlight = currentTreatment;

      try {
        await currentTreatment;
      } finally {
        if (!treatmentState.hasBeenThreated && treatmentInFlight === currentTreatment) {
          treatmentInFlight = undefined;
        }
      }
    };
    const service: ICamundaService = {
      get hasBeenThreated() {
        return treatmentState.hasBeenThreated;
      },
      set hasBeenThreated(value: boolean) {
        treatmentState.hasBeenThreated = value;
      },
      /**
       * Acknowledge the message to Step functions platform
       */
      async ack(
        message: IMessage<{ [s: string]: unknown }, IWorkflowProps<{ [s: string]: string | number | boolean }>>,
      ) {
        await runTreatment(async () => {
          await repo.sendTaskSuccess(message);
        });
      },
      /**
       * Un acknowledge the message to Step functions platform
       * This will handle failure.
       */
      async nack(error: FailureException) {
        await runTreatment(async () => {
          await repo.sendTaskFailure(error, messageWithoutSpan);
        });
      },
    };
    return [messageWithoutSpan, service];
  }
}

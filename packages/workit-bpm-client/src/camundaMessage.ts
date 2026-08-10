/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import {
  FailureException,
  ICamundaService,
  IMessage,
  IVariablePayload,
  IVariables,
  IWorkflowProps,
} from '@villedemontreal/workit-types';
import stringify from 'fast-safe-stringify';
import { CamundaMapperProperties } from './camundaMapperProperties';
import { Variables } from './variables';

export class CamundaMessage {
  public static wrap(payload: { task: IVariablePayload; taskService: any }): [IMessage, ICamundaService] {
    const { task } = payload;
    const properties = CamundaMapperProperties.map(task);
    const messageWithoutSpan = {
      body: task.variables.getAll(),
      properties,
    };
    // TODO: create a CamundaMessage builder
    const msg = {
      body: { ...messageWithoutSpan.body },
      properties: { ...messageWithoutSpan.properties },
    };
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
       * Acknowledge the message to Camunda platform
       * Variables will be updated if change has been detected
       */
      async ack(
        message: IMessage<{ [s: string]: unknown }, IWorkflowProps<{ [s: string]: string | number | boolean }>>,
      ) {
        await runTreatment(async () => {
          const vars = CamundaMessage.unwrap(message);
          await payload.taskService.complete(task, vars);
        });
      },
      /**
       * Un acknowledge the message to Camunda platform
       * This will handle failure.
       * Notice that on failure, the current camunda client doesn't update the variables
       */
      async nack(error: FailureException) {
        await runTreatment(async () => {
          const { retries, retryTimeout } = error;
          const retryTimeoutInMs = retryTimeout || 1000 * retries * 2;
          await payload.taskService.handleFailure(task, {
            errorMessage: error.message,
            errorDetails: stringify(error),
            retries,
            // TODO: Add to configuration
            retryTimeout: retryTimeoutInMs,
          });
        });
      },
    };
    return [msg, service];
  }

  public static unwrap(message: IMessage<unknown, IWorkflowProps<unknown>>): IVariables {
    const { body } = message;
    const vars = new Variables(body);
    Object.entries(body as object).forEach(([key, val]) => {
      if (Object.prototype.toString.call(val) === '[object Date]') {
        // Otherwise, we got invalid date
        // TODO: Check the cause
        vars.setTyped(key, { type: 'date', value: (val as Date).toUTCString(), valueInfo: {} });
      } else {
        vars.set(key, val);
      }
    });
    CamundaMessage._setCustomHeaders(vars as IVariables, message.properties.customHeaders as object);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return vars;
  }

  private static _setCustomHeaders(vars: IVariables, customHeaders: object) {
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      vars.set('_meta', { customHeaders });
    }
  }
}

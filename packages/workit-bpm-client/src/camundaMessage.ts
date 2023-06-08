/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { getVariablesWhenChanged, ProxyFactory } from '@villedemontreal/workit-core';
import {
  FailureException,
  ICamundaService,
  IMessage,
  IVariablePayload,
  IVariables,
  IWorkflowProps,
} from '@villedemontreal/workit-types';
import { CamundaMapperProperties } from './camundaMapperProperties';
import { Variables } from './variables';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stringify = require('fast-safe-stringify');

export class CamundaMessage {
  public static wrap(payload: { task: IVariablePayload; taskService: any }): [IMessage, ICamundaService] {
    const { task } = payload;
    const properties = CamundaMapperProperties.map(task);
    const messageWithoutSpan = {
      body: task.variables.getAll(),
      properties,
    };
    // TODO: create a CamundaMessage builder
    const msg = ProxyFactory.create({
      body: messageWithoutSpan.body,
      properties: messageWithoutSpan.properties,
    });
    return [
      msg,
      // TODO: create a CamundaService builder
      {
        hasBeenThreated: false,
        /**
         * Acknowledge the message to Camunda platform
         * Variables will be updated if change has been detected
         */
        async ack(
          message: IMessage<{ [s: string]: unknown }, IWorkflowProps<{ [s: string]: string | number | boolean }>>
        ) {
          if (this.hasBeenThreated) {
            return;
          }

          const vars = getVariablesWhenChanged<IVariables>(message, (m) => CamundaMessage.unwrap(m));

          await payload.taskService.complete(task, vars);
          this.hasBeenThreated = true;
        },
        /**
         * Un acknowledge the message to Camunda platform
         * This will handle failure.
         * Notice that on failure, the current camunda client doesn't update the variables
         */
        async nack(error: FailureException) {
          if (this.hasBeenThreated) {
            return;
          }
          const { retries, retryTimeout } = error;
          const retryTimeoutInMs = retryTimeout || 1000 * retries * 2;
          await payload.taskService.handleFailure(task, {
            errorMessage: error.message,
            errorDetails: stringify(error),
            retries,
            // TODO: Add to configuration
            retryTimeout: retryTimeoutInMs,
          });
          this.hasBeenThreated = true;
        },
      },
    ];
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

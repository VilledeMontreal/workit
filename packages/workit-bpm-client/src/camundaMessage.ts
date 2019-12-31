/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { getVariablesWhenChanged, ProxyFactory } from 'workit-core';
import {
  FailureException,
  ICamundaService,
  IMessage,
  IVariablePayload,
  IVariables,
  IWorkflowProps
} from 'workit-types';
import { CamundaMapperProperties } from './camundaMapperProperties';
import { Variables } from './variables';

const stringify = require('fast-safe-stringify');

export class CamundaMessage {
  public static wrap(payload: { task: IVariablePayload; taskService: any }): [IMessage, ICamundaService] {
    const { task } = payload;
    const properties = CamundaMapperProperties.map(task);
    const messageWithoutSpan = {
      body: task.variables.getAll(),
      properties: properties as IWorkflowProps
    };
    // TODO: create a CamundaMessage builder
    const msg = ProxyFactory.create({
      body: messageWithoutSpan.body,
      properties: messageWithoutSpan.properties
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
        async ack(message: IMessage) {
          if (this.hasBeenThreated) {
            return;
          }

          const vars = getVariablesWhenChanged<IVariables>(message, m => CamundaMessage.unwrap(m));

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
          const retries = error.retries;
          await payload.taskService.handleFailure(task, {
            errorMessage: error.message,
            errorDetails: stringify(error),
            retries,
            // TODO: Add to configuration
            retryTimeout: 1000 * retries * 2
          });
          this.hasBeenThreated = true;
        }
      }
    ];
  }

  public static unwrap(message: IMessage): IVariables {
    const body = message.body;
    const vars = new Variables(body);
    for (const key in body) {
      if (Object.prototype.toString.call(body[key]) === '[object Date]') {
        // Otherwise, we got invalid date
        // TODO: Check the cause
        vars.setTyped(key, { type: 'date', value: (body[key] as Date).toUTCString(), valueInfo: {} });
      } else {
        vars.set(key, body[key]);
      }
    }
    CamundaMessage._setCustomHeaders(vars, message.properties.customHeaders);
    return vars;
  }

  private static _setCustomHeaders(vars: IVariables, customHeaders: any) {
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      vars.set('_meta', { customHeaders });
    }
  }
}

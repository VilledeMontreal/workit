/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ZBClient } from 'zeebe-node';
// FIXME:dist folder....
import { CompleteFn } from 'zeebe-node/dist/lib/interfaces';
import { getVariablesWhenChanged } from '../../utils/utils';
import { ICamundaService } from '../camunda-n-mq/specs/camundaService';
import { FailureException } from '../camunda-n-mq/specs/failureException';
import { IMessage } from '../camunda-n-mq/specs/message';
import { IProperties } from '../camunda-n-mq/specs/properties';
import { IPayload } from './specs/payload';
import { ZeebeMapperProperties } from './zeebeMapperProperties';

export class ZeebeMessage {
  public static wrap<TVariables, TProps>(
    payload: IPayload<TVariables, TProps>,
    complete: CompleteFn<TVariables>,
    client: ZBClient
  ): [IMessage<TVariables, TProps>, ICamundaService] {
    const properties = ZeebeMapperProperties.map(payload);
    const messageWithoutSpan = {
      body: payload.variables,
      properties: properties as IProperties<TProps>
    };
    return [
      {
        body: messageWithoutSpan.body,
        properties: messageWithoutSpan.properties
      },
      {
        hasBeenThreated: false,
        async ack(message: IMessage) {
          if (this.hasBeenThreated) {
            return Promise.resolve();
          }

          const vars = getVariablesWhenChanged<IPayload<TVariables, TProps>>(message, msg => ZeebeMessage.unwrap(msg));

          if (vars) {
            this.hasBeenThreated = complete.success(vars.variables);
          } else {
            this.hasBeenThreated = complete.success();
          }

          return Promise.resolve();
        },
        async nack(error: FailureException) {
          if (this.hasBeenThreated) {
            return Promise.resolve();
          }
          const retries = error.retries;
          this.hasBeenThreated = complete.failure(error.message, retries);
          return Promise.resolve();
        }
      }
    ];
  }

  /**
   * Shallow copy
   */
  public static unwrap<TVariables, TProps>(message: IMessage<TVariables, TProps>): IPayload<TVariables, TProps> {
    const emptyPayload = ZeebeMapperProperties.unmap<TProps>(message.properties);
    (emptyPayload as IPayload<TVariables, TProps>).variables = message.body;
    return emptyPayload as IPayload<TVariables, TProps>;
  }
}

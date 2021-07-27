/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { getVariablesWhenChanged } from 'workit-core';
import { FailureException, ICamundaService, IMessage, IPayload, IWorkflowProps } from 'workit-types';
// FIXME:dist folder....
import { CompleteFn } from 'zeebe-node/dist/lib/interfaces';
import { ZeebeMapperProperties } from './zeebeMapperProperties';

export class ZeebeMessage {
  public static wrap<TVariables, TProps>(
    payload: IPayload<TVariables, TProps>,
    complete: CompleteFn<TVariables>
  ): [IMessage<TVariables, IWorkflowProps<TProps>>, ICamundaService] {
    const properties = ZeebeMapperProperties.map(payload);
    return [
      {
        body: payload.variables,
        properties,
      },
      {
        hasBeenThreated: false,
        async ack(message: IMessage<Partial<TVariables> | undefined, IWorkflowProps<unknown>>): Promise<void> {
          if (this.hasBeenThreated) {
            return;
          }

          // TODO: change any to real type body
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const vars = getVariablesWhenChanged<any>(message, (msg) => ZeebeMessage.unwrap(msg));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          this.hasBeenThreated = await complete.success(vars?.variables);
        },
        nack(error: FailureException) {
          if (this.hasBeenThreated) {
            return Promise.resolve();
          }
          const { retries } = error;
          // TODO: check if zeebe-node made the type correction
          this.hasBeenThreated = complete.failure(error.message, retries) as unknown as boolean;
          return Promise.resolve();
        },
      },
    ];
  }

  /**
   * Shallow copy
   */
  public static unwrap<TVariables, TProps>(
    message: IMessage<TVariables, IWorkflowProps<TProps>>
  ): IPayload<TVariables, TProps> {
    const emptyPayload = ZeebeMapperProperties.unmap<TProps>(message.properties);
    (emptyPayload as IPayload<TVariables, TProps>).variables = message.body;
    return emptyPayload as IPayload<TVariables, TProps>;
  }
}

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { ZBClient } from 'zeebe-node';
import { getVariablesWhenChanged } from '../../utils/utils';
import { ICamundaService } from '../camunda-n-mq/specs/camundaService';
import { FailureException } from '../camunda-n-mq/specs/failureException';
import { IMessage } from '../camunda-n-mq/specs/message';
import { IProperties } from '../camunda-n-mq/specs/properties';
import { CamundaClientTracer } from '../core/instrumentations/camundaClientTracer';
import { APM } from '../core/instrumentations/enums/apm';
import { ICCInstrumentationHandler } from '../core/instrumentations/specs/instrumentation';
// import { ProxyFactory } from '../core/proxyFactory';
import { IPayload } from './specs/payload';
import { ZeebeMapperProperties } from './zeebeMapperProperties';

export class ZeebeMessage {
  public static wrap(
    payload: IPayload,
    complete,
    client: ZBClient,
    apm: ICCInstrumentationHandler
  ): [IMessage, ICamundaService] {
    const properties = ZeebeMapperProperties.map(payload);
    const tracer = apm.get(APM.tracer) as CamundaClientTracer;
    const messageWithoutSpan = {
      body: payload.payload,
      properties: properties as IProperties
    };
    const spans = tracer.createRootSpanOnMessage(messageWithoutSpan);
    // const messageWithProxy = ProxyFactory.create({
    //   body: messageWithoutSpan.body,
    //   properties: messageWithoutSpan.properties,
    //   span,
    // });
    return [
      {
        body: messageWithoutSpan.body,
        properties: messageWithoutSpan.properties,
        spans
      },
      {
        hasBeenThreated: false,
        async ack(message: IMessage) {
          if (this.hasBeenThreated) {
            return;
          }
          const vars = getVariablesWhenChanged(message, msg => ZeebeMessage.unwrap(msg));
          complete(vars);
          this.hasBeenThreated = true;
        },
        async nack(error: FailureException) {
          if (this.hasBeenThreated) {
            return;
          }
          const retries = error.retries;
          await client.failJob({ retries, jobKey: payload.key, errorMessage: error.message });
          this.hasBeenThreated = true;
        }
      }
    ];
  }

  /**
   * Shallow copy
   */
  public static unwrap(message: IMessage): IPayload {
    const emptyPayload = ZeebeMapperProperties.unmap(message.properties);
    emptyPayload.payload = message.body;
    return emptyPayload as IPayload;
  }
}

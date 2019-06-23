// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { inject, injectable } from 'inversify';
import { FORMAT_TEXT_MAP, Reference, Span, SpanContext, Tags, Tracer } from 'opentracing';
import { SERVICE_IDENTIFIER } from '../../../config/constants/identifiers';
import { IMessage, IMessageBase } from '../../camunda-n-mq/specs/message';
import { APM } from './enums/apm';
import { ICamundaClientTracer } from './specs/camundaClientTracer';

import 'reflect-metadata';
@injectable()
export class CamundaClientTracer implements ICamundaClientTracer {
  private readonly _tracer: Tracer;
  constructor(@inject(SERVICE_IDENTIFIER.tracer) tracer: Tracer) {
    this._tracer = tracer;
  }
  get kind() {
    return APM.tracer;
  }
  public createRootSpanOnMessage(message: IMessageBase): Span {
    const spanContext = this._tracer.extract(FORMAT_TEXT_MAP, message) as any;
    const properties = message.properties;
    let spanOptions: { references: Reference[] } | undefined;
    if (spanContext && spanContext.isValid) {
      const ref = new Reference('follows_from', spanContext as SpanContext);
      spanOptions = { references: [ref] };
    }
    const rootSpan = this._tracer.startSpan('handle_message', spanOptions);
    rootSpan.addTags({ activityId: properties.activityId });
    rootSpan.addTags({ businessKey: properties.businessKey });
    rootSpan.addTags({ workerId: properties.workerId });
    rootSpan.addTags({ topicName: properties.topicName });
    return rootSpan;
  }
  public onMessageFailed(e: Error, { spans }: IMessage): void {
    const span = spans;
    span.setTag(Tags.ERROR, true);
    span.log(e);
  }
  public onMessageSuccess({ spans }: IMessage): void {
    spans.finish();
  }
}

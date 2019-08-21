import { SpanContext } from '@opencensus/core';
import { IMessageBase } from '../../camunda-n-mq/specs/message';
export interface IWorkitFormat {
  extractFromMessage(message: IMessageBase): SpanContext | null;
}

export function isWorkitPropagator(obj: any): obj is IWorkitFormat {
  return obj && typeof obj.extractFromMessage === 'function';
}

// code origin comes from https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-propagation-jaeger/src/jaeger-format.ts

import { HeaderGetter, HeaderSetter, Propagation, SpanContext } from '@opencensus/core';
import * as crypto from 'crypto';
import * as uuid from 'uuid';
import { IMessageBase } from '../../camunda-n-mq/specs/message';
import { IWorkitFormat } from '../specs/workitFormat';
import { isValidSpanId, isValidTraceId } from '../validators';
// TRACER_STATE_HEADER_NAME is the header key used for a span's serialized
// context.
export const TRACER_STATE_HEADER_NAME = process.env.TRACER_STATE_HEADER_NAME || 'vdm-trace-id';

// JAEGER_DEBUG_HEADER is the name of an HTTP header or a TextMap carrier key
// which, if found in the carrier, forces the trace to be sampled as "debug"
// trace.
export const JAEGER_DEBUG_HEADER = process.env.JAEGER_DEBUG_HEADER || 'jaeger-debug-id';

export const DEBUG_VALUE = Number(process.env.DEBUG_VALUE) || 2;

export const SAMPLED_VALUE = Number(process.env.SAMPLED_VALUE) || 1;

/**
 * Propagates span context through Jaeger trace-id propagation.
 *  The format of the header is described in the jaeger documentation:
 *  (https://www.jaegertracing.io/docs/client-libraries/)
 *  TODO: extends this class and make it abstract in order to provide extractFromMessage method
 */
export abstract class JaegerFormat implements Propagation, IWorkitFormat {
  /**
   * Gets the trace context from a request headers. If there is no trace context
   * in the headers, null is returned.
   * @param getter
   */
  public extract(getter: HeaderGetter): SpanContext | null {
    const debugId = this.parseHeader(getter.getHeader(JAEGER_DEBUG_HEADER));
    const tracerStateHeader = this.parseHeader(getter.getHeader(TRACER_STATE_HEADER_NAME));

    if (!tracerStateHeader) return null;
    const tracerStateHeaderParts = tracerStateHeader.split(':');
    if (tracerStateHeaderParts.length !== 4) return null;

    const traceId = tracerStateHeaderParts[0];
    const spanId = tracerStateHeaderParts[1];
    const jflags = Number(
      `0x${isNaN(Number(tracerStateHeaderParts[3])) ? SAMPLED_VALUE : Number(tracerStateHeaderParts[3])}`
    );
    /* tslint:disable:no-bitwise */
    const sampled = jflags & SAMPLED_VALUE;
    const debug = jflags & DEBUG_VALUE || (debugId ? SAMPLED_VALUE : 0);
    /* tslint:enable:no-bitwise */
    const options = sampled || debug ? SAMPLED_VALUE : 0;

    return { traceId, spanId, options };
  }

  public abstract extractFromMessage(message: IMessageBase): SpanContext | null;

  /**
   * Adds a trace context in a request headers.
   * @param setter
   * @param spanContext
   */
  public inject(setter: HeaderSetter, spanContext: SpanContext): void {
    if (!spanContext || !isValidTraceId(spanContext.traceId) || !isValidSpanId(spanContext.spanId)) {
      return;
    }

    let flags = '0';
    if (spanContext.options) {
      /* tslint:disable:no-bitwise */
      flags = (spanContext.options & SAMPLED_VALUE ? SAMPLED_VALUE : 0).toString(16);
      /* tslint:enable:no-bitwise */
    }

    // {parent-span-id} Deprecated, most Jaeger clients ignore on the receiving
    // side, but still include it on the sending side.
    const header = [spanContext.traceId, spanContext.spanId, /** parent-span-id */ '', flags].join(':');
    setter.setHeader(TRACER_STATE_HEADER_NAME, header);
  }

  /**
   * Generate SpanContexts
   */
  public generate(): SpanContext {
    return {
      traceId: uuid
        .v4()
        .split('-')
        .join(''),
      spanId: crypto.randomBytes(8).toString('hex'),
      options: SAMPLED_VALUE
    };
  }

  /** Converts a headers type to a string. */
  protected parseHeader(str: string | string[] | undefined): string | undefined {
    if (Array.isArray(str)) {
      return str[0];
    }
    return str;
  }
}

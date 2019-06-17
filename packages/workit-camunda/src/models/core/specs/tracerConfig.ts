import { Span } from 'opentracing';
import { IMessage } from '../../camunda-n-mq/specs/message';
import { IReporter } from './reporter';
import { ISampler } from './sampler';

export interface ITracerConfig<TBody = any> {
  /**
   * Default worker name
   */
  serviceName: string;
  sampler: ISampler;
  reporter: IReporter;
  spanFactory: (variables: TBody) => Span;
  injector: (message: IMessage) => void;
}

export interface ITracerOptions {
  tracer: ITracerConfig;
}

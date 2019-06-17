import { IMessageBase } from '../../../camunda-n-mq/specs/message';
import { ICamundaClientInstrumentation } from './camundaClientInstrumentation';

export interface ICamundaClientTracer extends ICamundaClientInstrumentation {
  createRootSpanOnMessage<TBody = any, TProps = any>(payload: IMessageBase<TBody, TProps>);
}

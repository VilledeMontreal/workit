import { IMessage } from '../../../camunda-n-mq/specs/message';

export interface ICamundaClientInstrumentation {
  kind: string;
  onMessageFailed(e: Error, message: IMessage): void;
  onMessageSuccess(message: IMessage): void;
}

import { IMessage } from '../../../camunda-n-mq/specs/message';

export interface IProcessHandler {
  on(event: 'message-handled', listener: (e: Error, message: IMessage) => void): this;
  on(event: 'message', listener: (message: IMessage) => void): this;
  handle(...args: any[]): Promise<void>;
}

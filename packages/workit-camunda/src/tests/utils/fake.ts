import { Client } from '../../models/camunda-n-mq/client';
import { ICamundaService } from '../../models/camunda-n-mq/specs/camundaService';
import { IMessage } from '../../models/camunda-n-mq/specs/message';
import { TaskBase } from '../../models/core/specs/taskBase';
// tslint:disable:max-classes-per-file

export class FakeTask extends TaskBase<IMessage> {
  constructor() {
    super();
  }
  public execute(model: IMessage): Promise<IMessage> {
    return Promise.resolve(model);
  }
}

export class FakeClient extends Client<any> {
  constructor() {
    super({});
  }
  public subscribe(onMessageReceived: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void> {
    return Promise.resolve();
  }
  public unsubscribe(): Promise<void> {
    return Promise.resolve();
  }
}

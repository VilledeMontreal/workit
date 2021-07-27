import { TaskBase } from '@villedemontreal/workit-core';
import { IMessage } from '@villedemontreal/workit-types';

export class HelloWorldTask extends TaskBase<IMessage> {
  public execute(message: IMessage): Promise<IMessage> {
    const { properties } = message;
    console.log(`Executing task: ${properties.activityId}`);
    console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
    // put your business logic here
    return Promise.resolve(message);
  }
}

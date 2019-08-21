import { IMessage } from "../../src";
import { TaskBase } from "../../src/models/core/specs/taskBase";
// tslint:disable:no-console
export class HelloWorldTaskV3 extends TaskBase<IMessage> {
  public execute(message: IMessage): Promise<IMessage> {
      const { properties } = message;
      // --------------------------
      console.log(`Executing task: ${properties.activityId} with the class HelloWorldTaskV3`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
      console.log(`version: ${properties.workflowDefinitionVersion}`);
      // put your business logic here
      return Promise.resolve(message);
  }
}
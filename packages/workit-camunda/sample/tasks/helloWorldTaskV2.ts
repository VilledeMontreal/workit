import { IMessage } from "../../src";
import { TaskBase } from "../../src/models/core/specs/taskBase";
// tslint:disable:no-console
export class HelloWorldTaskV2 extends TaskBase<IMessage> {
  public execute(message: IMessage): Promise<IMessage> {
      const { properties, spans } = message;
      // --------------------------
      // You can use doamain probe pattern here.
      const tracer =  spans.tracer();
      const context = spans.context();
      const span = tracer.startSpan("HelloWorldTaskV2", { childOf: context });
      span.log({ test: true });
      console.log(`Executing task: ${properties.activityId} with the class HelloWorldTaskV2`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
      console.log(`version: ${properties.workflowDefinitionVersion}`);
      // put your business logic here
      span.finish();
      return Promise.resolve(message);
  }
}
import { IMessage } from "../../src";
import { TaskBase } from "../../src/models/core/specs/taskBase";
// tslint:disable:no-console
export class HelloWorldTask extends TaskBase<IMessage> {
  public execute(message: IMessage): Promise<IMessage> {
      const { properties, spans } = message;
      // --------------------------
      // You can use doamain probe pattern here.
      const tracer =  spans.tracer();
      const context = spans.context();
      const span = tracer.startSpan("HelloWorldTask", { childOf: context });
      span.log({ test: true });
      console.log(`Executing task: ${properties.activityId}`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
      message.body.test = true;
      // put your business logic here
      span.finish();
      return Promise.resolve(message);
  }
}
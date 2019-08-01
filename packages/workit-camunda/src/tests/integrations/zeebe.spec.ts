import { CoreTracer, Tracer } from '@opencensus/core';
import { EventEmitter } from 'events';
import * as path from 'path';
import { Client } from '../../models/camunda-n-mq/client';
import { ICamundaService } from '../../models/camunda-n-mq/specs/camundaService';
import { IMessage } from '../../models/camunda-n-mq/specs/message';
// import { SCProcessHandler } from '../../models/core/processHandler/simpleCamundaProcessHandler';
import { IProcessHandler } from '../../models/core/processHandler/specs/processHandler';
import { IProcessHandlerConfig } from '../../models/core/processHandler/specs/processHandlerConfig';
import { IFailureStrategy } from '../../models/core/specs/failureStrategy';
import { ISuccessStrategy } from '../../models/core/specs/successStrategy';
import { TaskBase } from '../../models/core/specs/taskBase';
import { FailureStrategySimple } from '../../models/core/strategies/FailureStrategySimple';
import { Worker } from '../../models/core/worker';
import { IoC } from '../../models/IoC';
import { ZeebeClient } from '../../models/zeebe/zeebeClient';

process.env.ZB_NODE_LOG_LEVEL = process.env.ZB_NODE_LOG_LEVEL || 'NONE';

export class SuccessStrategy implements ISuccessStrategy {
  private readonly _done: (e?: Error) => void;
  constructor(done: (e?: Error) => void) {
    this._done = done;
  }
  public handle(message: IMessage, service: ICamundaService): Promise<void> {
    try {
      return service.ack(message);
    } catch (error) {
      this._done(error);
      return Promise.reject(error);
    } finally {
      this._done();
    }
  }
}
// tslint:disable-next-line: max-classes-per-file
export class HelloWorldTask extends TaskBase<IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    return Promise.resolve(message);
  }
}

IoC.bindTo(HelloWorldTask, 'ServiceTask_0g6tf5f');

// tslint:disable-next-line: max-classes-per-file
export class SCProcessHandlerTest<T = any, K = any> extends EventEmitter implements IProcessHandler {
  protected readonly _config: Partial<IProcessHandlerConfig>;
  protected readonly _success: ISuccessStrategy;
  protected readonly _failure: IFailureStrategy;
  protected readonly _tracer: Tracer;
  constructor(
    successStrategy: ISuccessStrategy,
    failureStrategy: IFailureStrategy,
    tracer: Tracer,
    config?: IProcessHandlerConfig
  ) {
    super();
    this._tracer = tracer;
    this._config = config || {};
    this._success = successStrategy;
    this._failure = failureStrategy;
  }

  public handle = async (message: IMessage<T, K>, service: ICamundaService): Promise<void> => {
    // tslint:disable-next-line: no-console
    console.log(message.properties);
    await this._success.handle(message, service);
  };
}

// tslint:disable-next-line: max-func-body-length
describe('ZeebeClient', () => {
  let zbc: ZeebeClient;
  let worker: Worker;
  const createWorkerInstance = (topicName: string, done: (e?: Error) => void) => {
    zbc = new ZeebeClient({ workerId: 'jest-integration', baseUrl: 'localhost:26500', topicName });
    const successHandler = new SuccessStrategy(done);
    const failureHandler = new FailureStrategySimple();
    const client = new Client(zbc);
    const processHandler = new SCProcessHandlerTest(successHandler, failureHandler, new CoreTracer());
    return new Worker(client, processHandler);
  };
  beforeEach(() => {
    // tslint:disable-next-line: no-empty
    worker = createWorkerInstance('', () => {});
  });

  afterEach(async () => {
    try {
      await worker.stop();
      await zbc.unsubscribe(); // Makes sure we don't forget to close connection
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log(error);
    }
  });

  it('Deploys a single workflow', async () => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/hello-world.bpmn'));
    expect(res.workflows.length).toBe(1);
    expect(res.workflows[0].bpmnProcessId).toBe('hello-world');
  });

  it('Does not redeploy a workflow when that workflow is already deployed', async () => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/hello-world.bpmn'));
    expect(res.workflows.length).toBe(1);
    expect(res.workflows[0].version > 1).toBe(false);
  });

  it('Can create a worker', async () => {
    worker.start();
    await worker.run();
    expect(worker).toBeTruthy();
  });

  it('Can start a workflow', async () => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/hello-world.bpmn'));
    expect(res.workflows.length).toBe(1);

    const workflowInstance = await zbc.createWorkflowInstance({
      bpmnProcessId: 'hello-world',
      variables: {}
    });
    expect(workflowInstance.bpmnProcessId).toBe('hello-world');
    expect(workflowInstance.workflowInstanceKey).toBeTruthy();
  });

  it.skip('Can receive a valid workflow instance', async done => {
    await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/hello-world.bpmn'));
    const w = createWorkerInstance('console-log', done);
    try {
      // tslint:disable-next-line: no-floating-promises
      await w.run();
    } catch (e) {
      done(e);
    } finally {
      await w.stop();
    }
  });

  it('Can cancel a workflow', async done => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/hello-world.bpmn'));
    expect(res.workflows.length).toBe(1);
    expect(res.workflows[0].bpmnProcessId).toBe('hello-world');

    const wf = await zbc.createWorkflowInstance({
      bpmnProcessId: 'hello-world',
      variables: {}
    });
    const wfi = wf.workflowInstanceKey;
    expect(wfi).toBeTruthy();

    await zbc.cancelWorkflowInstance(wfi);

    try {
      await zbc.cancelWorkflowInstance(wfi); // A call to cancel a workflow that doesn't exist should throw
    } catch (e) {
      done();
    }
  });

  it('does not retry the deployment of a broken BPMN file', async () => {
    try {
      await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/broken-bpmn.bpmn'));
    } catch (e) {
      expect(e.message.indexOf('3 INVALID_ARGUMENT:')).toBe(0);
    }
  });

  it("does not retry to cancel a workflow instance that doesn't exist", async () => {
    expect.assertions(1);
    try {
      await zbc.cancelWorkflowInstance('2251799813686202');
    } catch (e) {
      expect(e.message.indexOf('5 NOT_FOUND:')).toBe(0);
    }
  });
});

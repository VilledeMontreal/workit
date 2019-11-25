/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CoreTracer } from '@opencensus/core';
import * as crypto from 'crypto';
import * as path from 'path';
import { FailureStrategySimple, IoC, SCProcessHandler, TaskBase, Worker } from 'workit-core';
import { ICamundaService, IMessage, ISuccessStrategy } from 'workit-types';
import { ZeebeClient } from 'workit-zeebe-client';
import { Client } from '../../src/camunda-n-mq/client';


process.env.ZB_NODE_LOG_LEVEL = process.env.ZB_NODE_LOG_LEVEL || 'NONE';

export class SuccessStrategy implements ISuccessStrategy {
  private readonly _done: (e?: Error, message?: IMessage) => void;
  constructor(done: (e?: Error, message?: IMessage) => void) {
    this._done = done;
  }
  public handle(message: IMessage, service: ICamundaService): Promise<void> {
    try {
      return service.ack(message);
    } catch (error) {
      this._done(error);
      return Promise.reject(error);
    } finally {
      this._done(undefined, message);
    }
  }
}

// tslint:disable-next-line: max-classes-per-file
export class HelloWorldTask extends TaskBase<IMessage> {
  private readonly _expect: ((message: IMessage<any, any>) => void) | undefined;
  constructor(expect?: ((message: IMessage<any, any>) => void) | undefined) {
    super();
    this._expect = expect;
  }
  public async execute(message: IMessage): Promise<IMessage> {
    if (this._expect) {
      this._expect(message);
    }
    return Promise.resolve(message);
  }
}

IoC.bindToObject(new HelloWorldTask(), 'ServiceTask_0g6tf5f');

// tslint:disable-next-line: max-func-body-length
describe('ZeebeClient', () => {
  const zbc: ZeebeClient = new ZeebeClient({ workerId: 'jest-integration', baseUrl: 'localhost:26500', topicName: '' });
  const workers: Worker[] = [];
  const createWorkerInstance = (topicName: string, done: (e?: Error, message?: IMessage) => void) => {
    const successHandler = new SuccessStrategy(done);
    const failureHandler = new FailureStrategySimple();
    const client = new Client(new ZeebeClient({ workerId: 'jest-integration', baseUrl: 'localhost:26500', topicName }));
    const processHandler = new SCProcessHandler(successHandler, failureHandler, new CoreTracer());
    return new Worker(client, processHandler);
  };
  beforeEach(() => {
    // tslint:disable-next-line: no-empty
    workers.push(createWorkerInstance('', () => {}));
  });

  afterEach(async () => {
    try {
      for (const worker of workers) {
        await worker.stop();
      }
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
    const worker = workers[0];
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

  it('Can receive a valid workflow instance', async done => {
    await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/hello-world.bpmn'));
    workers.unshift(createWorkerInstance('console-log', done));
    try {
      await workers[0].run();
    } catch (e) {
      done(e);
    }
  });

  it('Can start a workflow with a message', async done => {
    const deploy = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/msg-start.bpmn'));
    expect(deploy.key).toBeTruthy();

    const randomId = crypto.randomBytes(16).toString('hex');

    await zbc.publishMessage({
      correlation: '',
      name: 'MSG-START_JOB',
      timeToLive: 1000,
      variables: {
        testKey: randomId
      }
    });

    workers.unshift(createWorkerInstance('console-log-msg', done));

    IoC.unbind('ServiceTask_0f6zc7d');
    IoC.bindToObject(
      new HelloWorldTask(message => {
        expect(message.properties.customHeaders.message.indexOf('Workflow') !== -1).toBe(true);
        expect(message.body.testKey).toBe(randomId); // Makes sure the worker isn't responding to another message
      }),
      'ServiceTask_0f6zc7d'
    );

    try {
      await workers[0].run();
    } catch (e) {
      done(e);
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
      // A call to cancel a workflow that doesn't exist should throw
      await zbc.cancelWorkflowInstance(wfi);
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
    try {
      await zbc.cancelWorkflowInstance('2251799813686202');
    } catch (e) {
      expect(e.message.indexOf('5 NOT_FOUND:')).toBe(0);
    }
  });

  it('Correctly branches on variables', async done => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/conditional-pathway.bpmn'));
    expect(res.workflows.length).toBe(1);
    expect(res.workflows[0].bpmnProcessId).toBe('condition-test');

    const wf = await zbc.createWorkflowInstance({
      bpmnProcessId: 'condition-test',
      variables: {
        conditionVariable: true
      }
    });
    const wfi = wf.workflowInstanceKey;
    expect(wfi).toBeTruthy();

    // tslint:disable-next-line: no-empty
    workers.unshift(createWorkerInstance('wait', () => {}));
    workers.unshift(createWorkerInstance('pathA', done));

    IoC.unbind('ServiceTask_0cz2k8t');
    IoC.bindToObject(
      new HelloWorldTask(message => {
        expect(message.properties.workflowInstanceKey).toBe(wfi);
      }),
      'ServiceTask_0cz2k8t'
    );

    IoC.bindToObject(
      new HelloWorldTask(message => {
        expect(message.properties.workflowInstanceKey).toBe(wfi);
        expect(message.body.conditionVariable).toBe(true);
      }),
      'ServiceTask_18goo5h'
    );

    try {
      await workers[1].run();
      await workers[0].run();
    } catch (e) {
      done(e);
    }
  });

  it('Can update workflow variables', async done => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/conditional-pathway.bpmn'));
    expect(res.workflows.length).toBe(1);
    expect(res.workflows[0].bpmnProcessId).toBe('condition-test');

    const wf = await zbc.createWorkflowInstance({
      bpmnProcessId: 'condition-test',
      variables: {
        conditionVariable: true
      }
    });
    const wfi = wf.workflowInstanceKey;
    expect(wfi).toBeTruthy();

    await zbc.updateVariables({
      processInstanceId: wfi,
      local: false,
      variables: {
        conditionVariable: false
      }
    });

    // tslint:disable-next-line: no-empty
    workers.unshift(createWorkerInstance('wait', () => {}));
    workers.unshift(createWorkerInstance('pathB', done));

    IoC.unbind('ServiceTask_0cz2k8t');
    IoC.bindToObject(
      new HelloWorldTask(message => {
        expect(message.properties.workflowInstanceKey).toBe(wfi);
      }),
      'ServiceTask_0cz2k8t'
    );

    IoC.bindToObject(
      new HelloWorldTask(message => {
        expect(message.properties.workflowInstanceKey).toBe(wfi);
        expect(message.body.conditionVariable).toBe(false);
      }),
      'ServiceTask_15isvh5'
    );

    try {
      await workers[1].run();
      await workers[0].run();
    } catch (e) {
      done(e);
    }
  });

  it('Causes 2 retries handled by FailureStrategySimple', async done => {
    const res = await zbc.deployWorkflow(path.join(__dirname, '..', './data/bpmn/zeebe/conditional-pathway.bpmn'));
    expect(res.workflows.length).toBe(1);
    expect(res.workflows[0].bpmnProcessId).toBe('condition-test');

    const wf = await zbc.createWorkflowInstance({
      bpmnProcessId: 'condition-test',
      variables: {
        conditionVariable: true
      }
    });
    const wfi = wf.workflowInstanceKey;
    expect(wfi).toBeTruthy();

    await zbc.updateVariables({
      processInstanceId: wfi,
      local: false,
      variables: {
        conditionVariable: false
      }
    });

    // tslint:disable-next-line: no-empty
    workers.unshift(createWorkerInstance('wait', done));

    IoC.unbind('ServiceTask_0cz2k8t');
    IoC.bindToObject(
      new HelloWorldTask(message => {
        expect(message.properties.workflowInstanceKey).toBe(wfi);
        let retries = message.properties.retries || 0;
        retries++;
        // Succeed on the third attempt
        if (retries < 3) {
          throw new Error('jest test');
        }
      }),
      'ServiceTask_0cz2k8t'
    );

    try {
      await workers[0].run();
    } catch (e) {
      done(e);
    }
  });
});

/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import {
  FailureStrategySimple,
  IoC,
  SCProcessHandler,
  SuccessStrategySimple,
  Worker,
} from '@villedemontreal/workit-core';
import {
  ICamundaClient,
  ICamundaConfig,
  IMessage,
  IProcessHandlerConfig,
  IWorkflowProps,
} from '@villedemontreal/workit-types';
import { BasicAuthInterceptor, Client as CamundaExternalClient } from 'camunda-external-task-client-js';
import * as nock from 'nock';
import { CamundaBpmClient } from '../../src/camundaBpmClient';
import { FakeTask } from '../utils/fake';
import { readJsonFileSync, run } from '../utils/func-test';
import { trace } from '@opentelemetry/api';

// If no TracerProvider is configured, this will return a NoopTracer
const NOOP_TRACER = trace.getTracer('workit:nooptracer');
const taskName = 'sample_activity';
const replyOnceThenEmpty = <T>(response: T): (() => T | never[]) => {
  let firstPoll = true;
  return () => {
    if (firstPoll) {
      firstPoll = false;
      return response;
    }
    return [];
  };
};
let worker: Worker;
let successHandler: SuccessStrategySimple;
let config: ICamundaConfig;
let failureHandler: FailureStrategySimple;
let client: CamundaBpmClient;
let processHandler: SCProcessHandler;

describe('Camunda Worker', function () {
  beforeEach(() => {
    const basicOauth = { username: 'admin', password: 'admin123' };
    config = {
      maxTasks: 1,
      workerId: 'demo',
      baseUrl: `http://localhost:8080/engine-rest`,
      topicName: 'topic_demo',
      bpmnKey: 'BPMN_DEMO',
      autoPoll: false,

      interceptors: [new BasicAuthInterceptor(basicOauth) as any],
    };

    const handlerConfig = {
      enableTracing: false,
      interceptors: [],
    };

    // init
    const clientLib: ICamundaClient = new CamundaExternalClient(config) as unknown as ICamundaClient;
    client = new CamundaBpmClient(config, clientLib);
    successHandler = new SuccessStrategySimple();
    failureHandler = new FailureStrategySimple();
    processHandler = new SCProcessHandler(successHandler, failureHandler, NOOP_TRACER, handlerConfig);
    (successHandler as any).handle = jest.fn();
    worker = new Worker(client, processHandler);

    // TODO: use IoC for getting worker instance... there is a bug with jest
    // https://github.com/inversify/InversifyJS/issues/997
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should call the url passed in the ctor', async () => {
    const scoped = nock('http://localhost:8080', { encodedQueryParams: true } as any)
      .persist()
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, [] as any);

    await run(worker, scoped);
  });
  it('should have Basic Auth', async () => {
    const scoped = nock('http://localhost:8080', { encodedQueryParams: true } as any)
      .persist()
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, function (this: any, uri: string, body: any) {
        expect(this.req.headers.authorization).toStrictEqual('Basic YWRtaW46YWRtaW4xMjM=');
        return [];
      });

    await run(worker, scoped);
  });
  it('should get the task and send failure to Camunda since no task is bound', async () => {
    const scoped = nock('http://localhost:8080')
      .persist()
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, replyOnceThenEmpty(readJsonFileSync('./tests/data/camunda-response.json')))
      .post('/engine-rest/external-task/37a72320-c4c2-11e8-a64b-0242ac110002/failure')
      .reply(204);

    await run(worker, scoped, 500);
  });

  it('should get the task and send success to Camunda since task is bound', async () => {
    const fakeTask = new FakeTask();
    (fakeTask as any).execute = jest.fn();
    IoC.unbind(taskName);
    IoC.bindToObject(fakeTask, taskName);

    const scoped = nock('http://localhost:8080')
      .persist()
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, replyOnceThenEmpty(readJsonFileSync('./tests/data/camunda-response.json')));

    worker.start();
    await worker.run();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });
    await worker.stop();
    expect(fakeTask.execute).toHaveBeenCalled();
    expect(successHandler.handle).toHaveBeenCalled();
    expect(successHandler.handle).toHaveBeenCalledTimes(1);
    expect(scoped.isDone()).toBe(true);
  });
  it('should execute interceptors', async () => {
    const fakeTask = new FakeTask();
    (fakeTask as any).execute = jest.fn();
    IoC.unbind(taskName);
    IoC.bindToObject(fakeTask, taskName);

    const scoped = nock('http://localhost:8080')
      .persist()
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, replyOnceThenEmpty(readJsonFileSync('./tests/data/camunda-response.json')));

    const configWithInterceptors: any & IProcessHandlerConfig = {
      maxTasks: 1,
      baseUrl: `http://localhost:8080/engine-rest`,
      topicName: 'topic_demo',
      interceptors: [
        (message: IMessage): Promise<IMessage> => {
          return Promise.resolve({
            body: null,
            properties: {
              workflowInstanceKey: '38963',
              bpmnProcessId: 'test-process',
              workflowDefinitionVersion: 4,
              workflowKey: '8806',
              activityId: 'ServiceTask_0xdwuw7',
              elementInstanceKey: '38967',
              customHeaders: { basic: 'Basic fake' },
              jobKey: '38968',
              processInstanceId: '38963',
              retries: 1,
              lockExpirationTime: new Date(),
              topicName: 'topic_demo',
              workerId: 'demo',
            },
          });
        },
        (message: IMessage): Promise<IMessage> => {
          return Promise.resolve({
            body: null,
            properties: {
              workflowInstanceKey: '38963',
              bpmnProcessId: 'test-process',
              workflowDefinitionVersion: 4,
              workflowKey: '8806',
              activityId: 'ServiceTask_0xdwuw7',
              elementInstanceKey: '38967',
              customHeaders: { jwt: 'jwt fake' },
              jobKey: '38968',
              processInstanceId: '38963',
              retries: 1,
              lockExpirationTime: new Date(),
              topicName: 'topic_demo',
              workerId: 'demo',
            },
          });
        },
      ],
      autoPoll: false,
      enableTracing: false,
    };
    const newProcessHandler = new SCProcessHandler(successHandler, failureHandler, NOOP_TRACER, configWithInterceptors);
    worker = new Worker(client, newProcessHandler);
    worker.start();
    await worker.run();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 700);
    });
    await worker.stop();
    const message = (fakeTask as any).execute.mock.calls[0][0] as IMessage<
      any,
      IWorkflowProps<{ jwt: string; basic: string }>
    >;

    expect(fakeTask.execute).toHaveBeenCalled();
    expect(successHandler.handle).toHaveBeenCalled();
    expect(successHandler.handle).toHaveBeenCalledTimes(1);
    expect(scoped.isDone()).toBe(true);
    expect(message.properties.customHeaders.jwt).toStrictEqual('jwt fake');
    expect(message.properties.customHeaders.basic).not.toStrictEqual('Basic fake');
  });
  it('should stop and restart polling', async () => {
    let pollCount = 0;
    nock('http://localhost:8080')
      .persist()
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, () => {
        pollCount += 1;
        return [];
      });

    worker = new Worker(client, processHandler);
    worker.start();
    await worker.run();
    await expect(worker.stop()).resolves.toBeUndefined();
    await worker.run();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 700);
    });
    await expect(worker.stop()).resolves.toBeUndefined();
    expect(pollCount).toBeGreaterThanOrEqual(2);
  });
});

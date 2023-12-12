/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { NoopTracer } from '@opentelemetry/api/build/src/trace/NoopTracer';
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

const taskName = 'sample_activity';
const NOOP_TRACER = new NoopTracer();
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

  it('should call the url passed in the ctor', (done) => {
    const scoped = nock('http://localhost:8080', { encodedQueryParams: true } as any)
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, [] as any);

    run(worker, scoped, done);
  });
  it('should have Basic Auth', (done) => {
    const scoped = nock('http://localhost:8080', { encodedQueryParams: true } as any)
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(function (this: any, uri: string, body: any, callback: (err: any, result: any) => void) {
        expect(this.req.headers.authorization).toStrictEqual('Basic YWRtaW46YWRtaW4xMjM=');
      });

    run(worker, scoped, done);
  });
  it('should get the task and send failure to Camunda since no task is bound', (done) => {
    const scoped = nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, () => {
        return readJsonFileSync('./tests/data/camunda-response.json');
      })
      .post('/engine-rest/external-task/37a72320-c4c2-11e8-a64b-0242ac110002/failure')
      .reply(204);

    run(worker, scoped, done, 500);
  });

  it('should get the task and send success to Camunda since task is bound', (done) => {
    const fakeTask = new FakeTask();
    (fakeTask as any).execute = jest.fn();
    IoC.unbind(taskName);
    IoC.bindToObject(fakeTask, taskName);

    const scoped = nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, readJsonFileSync('./tests/data/camunda-response.json'));

    worker.start();
    worker.run();

    setTimeout(() => {
      worker.stop().catch();
      expect(fakeTask.execute).toHaveBeenCalled();
      expect(successHandler.handle).toHaveBeenCalled();
      expect(successHandler.handle).toHaveBeenCalledTimes(1);
      expect(scoped.isDone()).toBe(true);
      done();
    }, 500);
  });
  it('should execute interceptors', (done) => {
    const fakeTask = new FakeTask();
    (fakeTask as any).execute = jest.fn();
    IoC.unbind(taskName);
    IoC.bindToObject(fakeTask, taskName);

    const scoped = nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, readJsonFileSync('./tests/data/camunda-response.json'));

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
    worker.run();

    setTimeout(() => {
      worker.stop().catch();
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
      done();
    }, 700);
  });
  it('should execute interceptors', async () => {
    nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, readJsonFileSync('./tests/data/camunda-response.json'));

    worker = new Worker(client, processHandler);
    worker.start();
    worker.run();
    await expect(worker.stop()).resolves.toBeUndefined();
    worker.run();
    setTimeout(
      async (_work) => {
        await expect(_work.stop()).resolves.toBeUndefined();
      },
      700,
      worker,
    );
  });
});

/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { NOOP_TRACER } from '@opentelemetry/api';
import * as nock from 'nock';
import { CamundaBpmClient, CamundaExternalClient, Utils } from 'workit-bpm-client';
import { FailureStrategySimple, IoC, SCProcessHandler, SuccessStrategySimple, Worker } from 'workit-core';
import { ICamundaClient, ICamundaConfig, IMessage, IProcessHandlerConfig, IWorkflowProps } from 'workit-types';
import { Client } from '../../src/camunda-n-mq/client';
import { SERVICE_IDENTIFIER } from '../../src/config/constants/identifiers';
import { FakeTask } from '../utils/fake';
import { run } from '../utils/func-test';

const taskName = 'sample_activity';
let worker: Worker;
let successHandler: SuccessStrategySimple;
let config: ICamundaConfig;
let camundaClient: CamundaBpmClient;
let failureHandler: FailureStrategySimple;
let client: Client<CamundaBpmClient>;
let processHandler: SCProcessHandler;

describe('Camunda Worker', function () {
  beforeEach(() => {
    // init
    const basicOauth = { username: 'admin', password: 'admin123' };
    IoC.unbind(SERVICE_IDENTIFIER.camunda_oauth_info);
    IoC.bindToObject(basicOauth, SERVICE_IDENTIFIER.camunda_oauth_info);

    config = {
      maxTasks: 1,
      workerId: 'demo',
      baseUrl: `http://localhost:8080/engine-rest`,
      topicName: 'topic_demo',
      bpmnKey: 'BPMN_DEMO',
      autoPoll: false,
      interceptors: Utils.defaultInterceptors(),
    };

    const clientLib: ICamundaClient = new CamundaExternalClient(config) as any;
    camundaClient = new CamundaBpmClient(config, clientLib);
    successHandler = new SuccessStrategySimple();
    failureHandler = new FailureStrategySimple();
    client = new Client(camundaClient);
    processHandler = new SCProcessHandler(successHandler, failureHandler, NOOP_TRACER, config as any);

    successHandler.handle = jest.fn().mockResolvedValueOnce({});
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
      .reply(function () {
        expect(this.req.headers.authorization).toStrictEqual('Basic YWRtaW46YWRtaW4xMjM=');
      });

    run(worker, scoped, done);
  });
  it('should get the task and send failure to Camunda since no task is bound', (done) => {
    const scoped = nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, () => {
        return require('../data/camunda-response.json');
      })
      .post('/engine-rest/external-task/37a72320-c4c2-11e8-a64b-0242ac110002/failure')
      .reply(204);

    run(worker, scoped, done, 500);
  });

  it('should get the task and send success to Camunda since task is bound', (done) => {
    const fakeTask = new FakeTask();
    fakeTask.execute = jest.fn().mockResolvedValueOnce({});
    IoC.unbind(taskName);
    IoC.bindToObject(fakeTask, taskName);

    const scoped = nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, require('../data/camunda-response.json'));

    worker.start();
    worker.run();

    setTimeout(() => {
      worker.stop().catch();
      expect(fakeTask.execute).toHaveBeenCalled();
      expect(successHandler.handle).toHaveBeenCalled();
      expect(successHandler.handle).toBeCalledTimes(1);
      expect(scoped.isDone()).toBe(true);
      done();
    }, 500);
  });
  it('should execute interceptors', (done) => {
    const fakeTask = new FakeTask();
    const executeTaskMock: jest.Mock<any> = (fakeTask.execute = jest.fn().mockResolvedValueOnce({}));
    IoC.unbind(taskName);
    IoC.bindToObject(fakeTask, taskName);

    const scoped = nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, require('../data/camunda-response.json'));

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
      const message = executeTaskMock.mock.calls[0][0] as IMessage<any, IWorkflowProps<{ jwt: string; basic: string }>>;

      expect(fakeTask.execute).toHaveBeenCalled();
      expect(successHandler.handle).toHaveBeenCalled();
      expect(successHandler.handle).toBeCalledTimes(1);
      expect(scoped.isDone()).toBe(true);
      expect(message.properties.customHeaders.jwt).toStrictEqual('jwt fake');
      expect(message.properties.customHeaders.basic).not.toStrictEqual('Basic fake');
      done();
    }, 700);
  });
  it('should execute interceptors', async () => {
    nock('http://localhost:8080')
      .post('/engine-rest/external-task/fetchAndLock')
      .reply(200, require('../data/camunda-response.json'));

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
      worker
    );
  });
});

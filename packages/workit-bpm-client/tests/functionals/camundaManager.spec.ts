/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Client as CamundaExternalClient } from 'camunda-external-task-client-js';
import nock = require('nock');
import { ICamundaClient } from 'workit-types';
import { CamundaBpmClient } from '../../src/camundaBpmClient';

let manager: CamundaBpmClient;

describe('Client Manager (Camunda BPM)', function () {
  beforeAll(() => {
    const config = {
      maxTasks: 1,
      workerId: 'demo',
      baseUrl: `http://localhost:8080/engine-rest`,
      topicName: 'topic_demo',
      autoPoll: false,
    };

    const clientLib: ICamundaClient = new CamundaExternalClient(config) as any;
    manager = new CamundaBpmClient(config, clientLib);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Deploy workflow', async () => {
    const scope = nock('http://localhost:8080')
      .post('/engine-rest/deployment/create')
      .reply(200, require('./__mocks__/deployResponse.camunda.json'));

    const path = `${process.cwd()}/tests/data/bpmn/camundaBpm/MESSAGE_EVENT.bpmn`;
    const result = await manager.deployWorkflow(path);

    expect(result).toMatchObject(require('./__mocks__/deployWorkflowResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Publish message', async () => {
    const scope = nock('http://localhost:8080').post('/engine-rest/message').reply(200);

    const result = await manager.publishMessage({
      correlation: undefined,
      name: '__MESSAGE_START_EVENT__',
      variables: { amount: 1000 },
      timeToLive: undefined,
      messageId: undefined,
    });

    expect(result).toBeUndefined();
    expect(scope.isDone()).toBeTruthy();
  });

  it('Create Instance', async () => {
    const scope = nock('http://localhost:8080')
      .post('/engine-rest/process-definition/key/message-event/start')
      .reply(200, require('./__mocks__/createWorkflowInstanceResponse.camunda.json'));

    const result = await manager.createWorkflowInstance({
      bpmnProcessId: 'message-event',
      variables: {
        amount: 1000,
        hello: 'world',
      },
    });

    expect(result).toMatchObject(require('./__mocks__/createInstanceResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Get Workflows', async () => {
    const scope = nock('http://localhost:8080')
      .get('/engine-rest/process-definition/count')
      .reply(200, { count: 3 })
      .get('/engine-rest/process-definition')
      .reply(200, require('./__mocks__/getWorkflowsResponse.camunda.json'));

    const result = await manager.getWorkflows();
    expect(result).toMatchObject(require('./__mocks__/getWorkflowsResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Get Workflows by limiting the result', async () => {
    const size = 2;
    const scope = nock('http://localhost:8080')
      .get('/engine-rest/process-definition/count')
      .query({ maxResults: size })
      .reply(200, { count: 3 })
      .get('/engine-rest/process-definition')
      .query({ maxResults: size })
      .reply(200, require('../data/camundaResponsePaginated'));

    const result = await manager.getWorkflows({ size });

    scope.done();
    expect(result).toMatchSnapshot();
  });

  it('Get Workflows by limiting the result and skipping 2 workflows', async () => {
    const size = 2;
    const from = 3;
    const scope = nock('http://localhost:8080')
      .get('/engine-rest/process-definition/count')
      .query({ firstResult: from, maxResults: size })
      .reply(200, { count: 4 })
      .get('/engine-rest/process-definition')
      .query({ firstResult: from, maxResults: size })
      .reply(200, require('../data/camundaResponsePaginated2'));

    const result = await manager.getWorkflows({ size, from });
    scope.done();
    expect(result).toMatchSnapshot();
  });

  it('Get Workflows by limiting the result and searching a specific workflow', async () => {
    const size = 2;
    const bpmnProcessId = 'message-event';

    const scope = nock('http://localhost:8080')
      .get('/engine-rest/process-definition/count')
      .query({ key: bpmnProcessId, maxResults: size })
      .reply(200, { count: 1 })
      .get('/engine-rest/process-definition')
      .query({ key: bpmnProcessId, maxResults: size })
      .reply(200, require('../data/camundaResponsePaginated2'));

    const result = await manager.getWorkflows({ size, bpmnProcessId });

    scope.done();
    expect(result).toMatchSnapshot();
  });

  it('Get a Workflow by bpmnProcessId', async () => {
    const bpmnProcessId = 'message-event';
    const scope = nock('http://localhost:8080')
      .get(`/engine-rest/process-definition/key/${bpmnProcessId}`)
      .reply(200, require('./__mocks__/getWorkflowResponse.2.camunda.json'))
      .get(`/engine-rest/process-definition/key/${bpmnProcessId}/xml`)
      .reply(200, require('./__mocks__/getWorkflowResponse.1.camunda.json'));

    const result = await manager.getWorkflow({
      bpmnProcessId,
    });

    expect(result).toMatchObject(require('./__mocks__/getWorkflowResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Get a Workflow by workflowKey', async () => {
    const workflowKey = 'message-event:6:76bf01bc-5410-11e9-8953-0242ac110002';
    const scope = nock('http://localhost:8080')
      .get(`/engine-rest/process-definition/${workflowKey}`)
      .reply(200, require('./__mocks__/getWorkflowResponse.2.camunda.json'))
      .get(`/engine-rest/process-definition/${workflowKey}/xml`)
      .reply(200, require('./__mocks__/getWorkflowResponse.1.camunda.json'));

    const result = await manager.getWorkflow({
      workflowKey,
    });

    expect(result).toMatchObject(require('./__mocks__/getWorkflowResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Update variable', async () => {
    const processInstanceId = '76c913e7-5410-11e9-8953-0242ac110002';
    const scope = nock('http://localhost:8080')
      .post(`/engine-rest/process-instance/${processInstanceId}/variables`)
      .reply(204);
    const result = await manager.updateVariables({
      processInstanceId,
      variables: {
        amount: 5,
      },
    });

    expect(result).toBeUndefined();
    expect(scope.isDone()).toBeTruthy();
  });

  it('Update retries', async () => {
    const jobKey = '76c93b00-5410-11e9-8953-0242ac110002';
    const scope = nock('http://localhost:8080').put(`/engine-rest/external-task/${jobKey}/retries`).reply(204);

    const result = await manager.updateJobRetries({
      jobKey,
      retries: 0,
    });

    expect(result).toBeUndefined();
    expect(scope.isDone()).toBeTruthy();
  });

  it('Resolve incident', async () => {
    const incidentId = 'db94be11-5417-11e9-8953-0242ac110002';
    const scope = nock('http://localhost:8080')
      .post('/engine-rest/process-instance/76c913e7-5410-11e9-8953-0242ac110002/modification')
      .reply(204)
      .get('/engine-rest/incident/')
      .query({ incidentId })
      .reply(200, require('./__mocks__/incidentResponse.camunda.json'));

    const result = await manager.resolveIncident(incidentId);

    expect(result).toBeUndefined();
    expect(scope.isDone()).toBeTruthy();
  });

  it('Cancel instance', async () => {
    const instanceId = '76c47ffe-5410-11e9-8953-0242ac110002';
    const scope = nock('http://localhost:8080')
      .delete(`/engine-rest/process-instance/${instanceId}`)
      .query({ skipCustomListeners: 'true', skipIoMappings: 'true', skipSubprocesses: 'true' })
      .reply(204);

    const result = await manager.cancelWorkflowInstance(instanceId);

    expect(result).toBeUndefined();
    expect(scope.isDone()).toBeTruthy();
  });
});

import { Client as CamundaExternalClient } from 'camunda-external-task-client-js';
import nock = require('nock');
import * as opentracing from 'opentracing';
import '../../config/ioc';
import { CamundaBpmClient } from '../../models/camunda/camundaBpmClient';
import { CamundaManager } from '../../models/camunda/camundaManager';
import { ICamundaClient } from '../../models/camunda/specs/camundaClient';
import { CamundaClientTracer } from '../../models/core/instrumentations/camundaClientTracer';
import { Instrumentation } from '../../models/core/instrumentations/instrumentation';

let manager: CamundaManager;
// tslint:disable:ter-prefer-arrow-callback
// tslint:disable:only-arrow-functions
// tslint:disable:max-func-body-length
describe('Client Manager (Camunda BPM)', function() {
  beforeAll(() => {
    const config = {
      maxTasks: 1,
      workerId: 'demo',
      baseUrl: `http://localhost:8080/engine-rest`,
      topicName: 'topic_demo',
      autoPoll: false
    };

    const clientLib: ICamundaClient = new CamundaExternalClient(config) as any;
    const noopTracer = new opentracing.Tracer();
    const ccTracer = new CamundaClientTracer(noopTracer);
    const instrumentation = new Instrumentation([ccTracer]);
    const camundaClient = new CamundaBpmClient(config, clientLib, instrumentation);

    manager = new CamundaManager(camundaClient);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Deploy workflow', async () => {
    const scope = nock('http://localhost:8080')
      .post('/engine-rest/deployment/create')
      .reply(200, require('./__mocks__/deployResponse.camunda.json'));

    const path = `${process.cwd()}/sample/MESSAGE_EVENT.bpmn`;
    const result = await manager.deployWorkflow(path);

    expect(result).toMatchObject(require('./__mocks__/deployWorkflowResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Publish message', async () => {
    const scope = nock('http://localhost:8080')
      .post('/engine-rest/message')
      .reply(200);

    const result = await manager.publishMessage({
      correlation: undefined,
      name: '__MESSAGE_START_EVENT__',
      variables: { amount: 1000 },
      timeToLive: undefined,
      messageId: undefined
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
        hello: 'world'
      }
    });

    expect(result).toMatchObject(require('./__mocks__/createInstanceResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Get Workflows', async () => {
    const scope = nock('http://localhost:8080')
      .get('/engine-rest/process-definition')
      .reply(200, require('./__mocks__/getWorkflowsResponse.camunda.json'));

    const result = await manager.getWorkflows();
    expect(result).toMatchObject(require('./__mocks__/getWorkflowsResult.json'));
    expect(scope.isDone()).toBeTruthy();
  });

  it('Get a Workflow by bpmnProcessId', async () => {
    const bpmnProcessId = 'message-event';
    const scope = nock('http://localhost:8080')
      .get(`/engine-rest/process-definition/key/${bpmnProcessId}`)
      .reply(200, require('./__mocks__/getWorkflowResponse.2.camunda.json'))
      .get(`/engine-rest/process-definition/key/${bpmnProcessId}/xml`)
      .reply(200, require('./__mocks__/getWorkflowResponse.1.camunda.json'));

    const result = await manager.getWorkflow({
      bpmnProcessId
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
      workflowKey
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
        amount: 5
      }
    });

    expect(result).toBeUndefined();
    expect(scope.isDone()).toBeTruthy();
  });

  it('Update retries', async () => {
    const jobKey = '76c93b00-5410-11e9-8953-0242ac110002';
    const scope = nock('http://localhost:8080')
      .put(`/engine-rest/external-task/${jobKey}/retries`)
      .reply(204);

    const result = await manager.updateJobRetries({
      jobKey,
      retries: 0
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

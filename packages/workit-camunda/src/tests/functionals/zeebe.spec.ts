// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import * as nock from 'nock';
import { ZBClient } from 'zeebe-node';
import { Client } from '../../models/camunda-n-mq/client';
import { ICamundaConfig } from '../../models/camunda/specs/camundaConfig';
import { Utils } from '../../models/camunda/utils';
import { SCProcessHandler } from '../../models/core/processHandler/simpleCamundaProcessHandler';
import { FailureStrategySimple } from '../../models/core/strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../../models/core/strategies/SuccessStrategySimple';
import { Worker } from '../../models/core/worker';
import { ZeebeClient } from '../../models/zeebe/zeebeClient';

process.env.ZB_NODE_LOG_LEVEL = process.env.ZB_NODE_LOG_LEVEL || 'NONE';
const run = (worker: Worker, done: any, delay: number = 500) => {
  worker.start();
  worker.run();

  setTimeout(async () => {
    await worker.stop();
    done();
  }, delay);
};
// tslint:disable:ter-prefer-arrow-callback
// tslint:disable:only-arrow-functions
// tslint:disable:max-func-body-length
describe('Zeebe Worker', function() {
  let worker: Worker;
  let config: ICamundaConfig;

  beforeEach(() => {
    config = {
      maxTasks: 1,
      workerId: 'test-worker',
      baseUrl: `localhost:26500`,
      topicName: 'demo-service',
      bpmnKey: 'test',
      autoPoll: false
    };
  });

  it('should instanciate the worker', done => {
    (async () => {
      const configuration = Utils.buildConfig(config as ICamundaConfig);
      const externalclient = new ZBClient(config.baseUrl!);
      const zeebeClient = new ZeebeClient(configuration, externalclient);
      const successHandler = new SuccessStrategySimple();
      const failureHandler = new FailureStrategySimple();
      const client = new Client(zeebeClient);
      successHandler.handle = jest.fn().mockResolvedValueOnce({});
      const processHandler = new SCProcessHandler(successHandler, failureHandler, config as any);
      worker = new Worker(client, processHandler);
      run(worker, done, 500);
    })().catch();
  });

  it('should get workflows', async () => {
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search')
      .query({ _source_excludes: 'bpmnXml' })
      .reply(200, require('../data/elasticResponse.workflow'));

    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const zeebeClient = new ZeebeClient(configuration, externalclient, {
      url: 'http://localhost:9200'
    });
    const response = await zeebeClient.getWorkflows();

    scope.done();
    expect(response).toMatchSnapshot();
  });

  it('should get MESSAGE_EVENT workflow', async () => {
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search')
      .reply(200, require('../data/elasticResponseAgg.workflow'));

    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const zeebeClient = new ZeebeClient(configuration, externalclient, {
      url: 'http://localhost:9200'
    });
    const response = await zeebeClient.getWorkflow({ bpmnProcessId: 'MESSAGE_EVENT' });

    scope.done();
    expect(response).toMatchSnapshot();
  });

  it('should generate an exception for cancelWorkflowInstance when key is malformed', async () => {
    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const zeebeClient = new ZeebeClient(configuration, externalclient);
    try {
      await zeebeClient.cancelWorkflowInstance('hello');
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
  it('should limit the number of document', async () => {
    const size = 5;
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', { query: { bool: { must: [] } } })
      .query({ _source_excludes: 'bpmnXml', size })
      .reply(200, require('../data/elasticResponse.paginated'));
    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const zeebeClient = new ZeebeClient(configuration, externalclient, {
      url: 'http://localhost:9200'
    });
    const response = await zeebeClient.getWorkflows({ size });
    scope.done();
    expect(response.items.length).toEqual(size);
    expect(response).toMatchSnapshot();
  });

  it('should limit the number of document and skip one document', async () => {
    const size = 4;
    const from = 1;
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', { query: { bool: { must: [] } } })
      .query({ _source_excludes: 'bpmnXml', size, from })
      .reply(200, require('../data/elasticResponse.paginated.skip'));
    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const zeebeClient = new ZeebeClient(configuration, externalclient, {
      url: 'http://localhost:9200'
    });
    const response = await zeebeClient.getWorkflows({ size, from });
    scope.done();
    expect(response.items.length).toEqual(size);
    expect(response).toMatchSnapshot();
  });

  it('should limit the number of document and search by bpmnProcessId', async () => {
    const size = 5;
    const bpmnProcessId = 'MESSAGE_EVENT';
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', {
        query: { bool: { must: [{ match: { bpmnProcessId: { query: bpmnProcessId } } }] } }
      })
      .query({ _source_excludes: 'bpmnXml', size })
      .reply(200, require('../data/elasticResponseBpmnProcessId.paginated'));

    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const zeebeClient = new ZeebeClient(configuration, externalclient, {
      url: 'http://localhost:9200'
    });
    const response = await zeebeClient.getWorkflows({ size, bpmnProcessId });
    scope.done();
    expect(response).toMatchSnapshot();
  });
});

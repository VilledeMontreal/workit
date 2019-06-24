// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import * as nock from 'nock';
import * as opentracing from 'opentracing';
import { ZBClient } from 'zeebe-node';
import { Client } from '../../models/camunda-n-mq/client';
import { ICamundaConfig } from '../../models/camunda/specs/camundaConfig';
import { Utils } from '../../models/camunda/utils';
import { CamundaClientTracer } from '../../models/core/instrumentations/camundaClientTracer';
import { Instrumentation } from '../../models/core/instrumentations/instrumentation';
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
      const noopTracer = new opentracing.Tracer();
      const ccTracer = new CamundaClientTracer(noopTracer);
      const instrumentation = new Instrumentation([ccTracer]);
      // issue with definition - fix with any
      const zeebeClient = new ZeebeClient(configuration, instrumentation, externalclient);
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
      .reply(200, require('../data/elasticResponse.workflow'));

    const configuration = Utils.buildConfig(config as ICamundaConfig);
    const externalclient = new ZBClient(config.baseUrl!);
    const noopTracer = new opentracing.Tracer();
    const ccTracer = new CamundaClientTracer(noopTracer);
    const instrumentation = new Instrumentation([ccTracer]);
    // issue with definition - fix with any
    const zeebeClient = new ZeebeClient(configuration, instrumentation, externalclient, {
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
    const noopTracer = new opentracing.Tracer();
    const ccTracer = new CamundaClientTracer(noopTracer);
    const instrumentation = new Instrumentation([ccTracer]);
    // issue with definition - fix with any
    const zeebeClient = new ZeebeClient(configuration, instrumentation, externalclient, {
      url: 'http://localhost:9200'
    });
    const response = await zeebeClient.getWorkflow({ bpmnProcessId: 'MESSAGE_EVENT' });

    scope.done();
    expect(response).toMatchSnapshot();
  });
});

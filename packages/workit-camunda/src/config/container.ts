/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CoreTracer } from '@opencensus/core';
import { logger as camundaLogger } from 'camunda-external-task-client-js';
import { EventEmitter } from 'events';
import { Container, decorate, injectable } from 'inversify';
import { logger } from '../models/camunda/logger';
import { ICamundaConfig } from '../models/camunda/specs/camundaConfig';
import { SCProcessHandler } from '../models/core/processHandler/simpleCamundaProcessHandler';
import { FailureStrategySimple } from '../models/core/strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../models/core/strategies/SuccessStrategySimple';
import { constants } from './constants';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

try {
  decorate(injectable(), EventEmitter);
} catch (error) {
  // tslint:disable: no-console
  console.log(
    `Warning: We detect that you load workit-camunda module more than once. This can happens when sub dependencies have workit-camunda in different versions. You need to get the same version (try using peerDependencies in package.json) or you know what you are doing.`
  );
}

export const kernel = new Container();
kernel
  .bind(SERVICE_IDENTIFIER.logger)
  .toConstantValue(camundaLogger)
  .whenTargetIsDefault();
Object.values(constants.envs).forEach(env => {
  kernel
    .bind(SERVICE_IDENTIFIER.logger)
    .toConstantValue(logger)
    .whenTargetNamed(env);
});

if (!process.env.SKIP_DEMO_CONFIG) {
  const configBase: ICamundaConfig = {
    workerId: 'demo',
    baseUrl: `__undefined__`,
    topicName: 'topic_demo'
  };

  const bpmnPlatformClientConfig = Object.assign({}, configBase, {
    baseUrl: `http://localhost:8080/engine-rest`,
    maxTasks: 32,
    autoPoll: false
  });

  const zeebeElasticExporterConfig = {
    url: `http://localhost:9200`
  };

  const zeebeClientConfig = Object.assign({}, configBase, { baseUrl: `localhost:26500` });

  kernel.bind(SERVICE_IDENTIFIER.camunda_external_config).toConstantValue(bpmnPlatformClientConfig);
  kernel.bind(SERVICE_IDENTIFIER.zeebe_external_config).toConstantValue(zeebeClientConfig);
  kernel.bind(SERVICE_IDENTIFIER.zeebe_elastic_exporter_config).toConstantValue(zeebeElasticExporterConfig);
}

kernel.bind(SERVICE_IDENTIFIER.tracer).toConstantValue(new CoreTracer());
kernel.bind(SERVICE_IDENTIFIER.success_strategy).toConstantValue(new SuccessStrategySimple());
kernel.bind(SERVICE_IDENTIFIER.failure_strategy).toConstantValue(new FailureStrategySimple());
kernel.bind(SERVICE_IDENTIFIER.process_handler).to(SCProcessHandler);

export const container = new Container();
container.parent = kernel;

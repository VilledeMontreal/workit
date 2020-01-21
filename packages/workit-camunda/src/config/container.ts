/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { camundaLogger, logger } from 'workit-bpm-client';
import { kernel } from 'workit-core';
import { ICamundaConfig } from 'workit-types';
import { constants } from './constants';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

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

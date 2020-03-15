/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { kernel } from 'workit-core';
import { ICamundaConfig } from 'workit-types';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

const configBase: ICamundaConfig = {
  workerId: 'demo',
  baseUrl: `__undefined__`,
  topicName: 'topic_demo'
};

const bpmnPlatformClientConfig = Object.assign({}, configBase, {
  baseUrl: process.env.CAMUNDA_BPM_ADDRESS || `http://localhost:8080/engine-rest`,
  maxTasks: 32,
  autoPoll: false
});

kernel.bind(SERVICE_IDENTIFIER.camunda_external_config).toConstantValue(bpmnPlatformClientConfig);

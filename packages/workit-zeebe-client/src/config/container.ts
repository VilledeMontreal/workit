/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { kernel } from 'workit-core';
import { ICamundaConfig } from 'workit-types';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

const configBase: ICamundaConfig = {
  workerId: 'demo',
  baseUrl: `__undefined__`,
  topicName: 'topic_demo',
};

const zeebeElasticExporterConfig = {
  url: `http://localhost:9200`,
};

const camundaCloudConfig = {} as Partial<{ oAuth: Record<string, unknown> }>;
if (process.env.ZEEBE_AUTHORIZATION_SERVER_URL) {
  camundaCloudConfig.oAuth = Object.entries({
    url: process.env.ZEEBE_AUTHORIZATION_SERVER_URL,
    audience: process.env.ZEEBE_ADDRESS?.split(':')[0],
    clientId: process.env.ZEEBE_CLIENT_ID,
    clientSecret: process.env.ZEEBE_CLIENT_SECRET,
  }).reduce((acc, [key, val]) => {
    if (val) acc[key] = val;
    return acc;
  }, {});
}

const zeebeClientConfig = {
  ...configBase,
  baseUrl: process.env.ZEEBE_ADDRESS || `localhost:26500`,
  ...camundaCloudConfig,
};
kernel.bind(SERVICE_IDENTIFIER.zeebe_external_config).toConstantValue(zeebeClientConfig);
kernel.bind(SERVICE_IDENTIFIER.zeebe_elastic_exporter_config).toConstantValue(zeebeElasticExporterConfig);

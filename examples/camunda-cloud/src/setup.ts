/*!
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from 'workit-camunda';
import { IoC } from 'workit-core';

IoC.bindToObject(
  {
    baseUrl: '<uuid-from-camunda-cloud>.zeebe.camunda.io:443',
    oAuth: {
      url: 'https://login.cloud.camunda.io/oauth/token',
      audience: '<uuid-from-camunda-cloud>.zeebe.camunda.io',
      clientId: '<your-client-id>',
      clientSecret: '<your-client-secret>',
      cacheOnDisk: true
    }
  },
  CORE_IDENTIFIER.zeebe_external_config
);

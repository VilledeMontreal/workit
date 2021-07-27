/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CamundaBpmClient, CamundaExternalClient } from 'workit-bpm-client';
import { IoC, Worker } from 'workit-core';
import { ZeebeClient } from 'workit-zeebe-client';
import { Client } from '../camunda-n-mq/client';
import { CamundaBpmWorker } from '../camundaBpm/camundaBpmWorker';
import { CamundaManager } from '../camundaBpm/camundaManager';
import { ZeebeManager } from '../zeebe/zeebeManager';
import { ZeebeWorker } from '../zeebe/zeebeWorker';
import { SERVICE_IDENTIFIER } from './constants/identifiers';
import { TAG } from './constants/tag';
import './container';

IoC.bindTo(
  ZeebeClient,
  SERVICE_IDENTIFIER.camunda_client,
  [
    SERVICE_IDENTIFIER.zeebe_external_config,
    SERVICE_IDENTIFIER.camunda_external_client,
    SERVICE_IDENTIFIER.zeebe_elastic_exporter_config,
  ],
  TAG.zeebe,
  false
);
IoC.bindTo(
  CamundaExternalClient,
  SERVICE_IDENTIFIER.camunda_external_client,
  [SERVICE_IDENTIFIER.camunda_external_config],
  null,
  false
);
IoC.bindTo(
  CamundaBpmClient,
  SERVICE_IDENTIFIER.camunda_client,
  [SERVICE_IDENTIFIER.camunda_external_config, SERVICE_IDENTIFIER.camunda_external_client],
  TAG.camundaBpm,
  false
);

IoC.bindTo(Client, SERVICE_IDENTIFIER.client, [SERVICE_IDENTIFIER.camunda_client], null, false);
IoC.bindTo(
  Worker,
  SERVICE_IDENTIFIER.worker,
  [SERVICE_IDENTIFIER.client, SERVICE_IDENTIFIER.process_handler],
  null,
  false
);

IoC.bindTo(ZeebeManager, SERVICE_IDENTIFIER.client_manager, [SERVICE_IDENTIFIER.camunda_client], TAG.zeebe, false);
IoC.bindTo(
  CamundaManager,
  SERVICE_IDENTIFIER.client_manager,
  [SERVICE_IDENTIFIER.camunda_client],
  TAG.camundaBpm,
  false
);
IoC.bindTo(
  ZeebeWorker,
  SERVICE_IDENTIFIER.worker,
  [SERVICE_IDENTIFIER.camunda_client, SERVICE_IDENTIFIER.process_handler],
  TAG.zeebe,
  false
);
IoC.bindTo(
  CamundaBpmWorker,
  SERVICE_IDENTIFIER.worker,
  [SERVICE_IDENTIFIER.camunda_client, SERVICE_IDENTIFIER.process_handler],
  TAG.camundaBpm,
  false
);

export const dirname = __dirname;

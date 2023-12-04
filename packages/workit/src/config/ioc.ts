/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CamundaBpmClient, CamundaExternalClient } from '@villedemontreal/workit-bpm-client';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { Client } from '../camunda-n-mq/client';
import { CamundaBpmWorker } from '../camundaBpm/camundaBpmWorker';
import { CamundaManager } from '../camundaBpm/camundaManager';
import { SERVICE_IDENTIFIER } from './constants/identifiers';
import { TAG } from './constants/tag';
import './container';

IoC.bindTo(
  CamundaExternalClient as new (...args: any[]) => unknown,
  SERVICE_IDENTIFIER.camunda_external_client,
  [SERVICE_IDENTIFIER.camunda_external_config],
  null,
  false,
);
IoC.bindTo(
  CamundaBpmClient,
  SERVICE_IDENTIFIER.camunda_client,
  [SERVICE_IDENTIFIER.camunda_external_config, SERVICE_IDENTIFIER.camunda_external_client],
  TAG.camundaBpm,
  false,
);

IoC.bindTo(Client, SERVICE_IDENTIFIER.client, [SERVICE_IDENTIFIER.camunda_client], null, false);
IoC.bindTo(
  Worker,
  SERVICE_IDENTIFIER.worker,
  [SERVICE_IDENTIFIER.client, SERVICE_IDENTIFIER.process_handler],
  null,
  false,
);

IoC.bindTo(
  CamundaManager,
  SERVICE_IDENTIFIER.client_manager,
  [SERVICE_IDENTIFIER.camunda_client],
  TAG.camundaBpm,
  false,
);

IoC.bindTo(
  CamundaBpmWorker,
  SERVICE_IDENTIFIER.worker,
  [SERVICE_IDENTIFIER.camunda_client, SERVICE_IDENTIFIER.process_handler],
  TAG.camundaBpm,
  false,
);

export const dirname = __dirname;

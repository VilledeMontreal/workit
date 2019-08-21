// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { Client as CamundaExternalClient } from 'camunda-external-task-client-js';
import { Client } from '../models/camunda-n-mq/client';
import { CamundaBpmClient } from '../models/camunda/camundaBpmClient';
import { CamundaBpmWorker } from '../models/camunda/camundaBpmWorker';
import { CamundaManager } from '../models/camunda/camundaManager';
import { Worker } from '../models/core/worker';
import { IoC } from '../models/IoC';
import { ZeebeClient } from '../models/zeebe/zeebeClient';
import { ZeebeManager } from '../models/zeebe/zeebeManager';
import { ZeebeWorker } from '../models/zeebe/zeebeWorker';
import { SERVICE_IDENTIFIER } from './constants/identifiers';
import { TAG } from './constants/tag';

IoC.bindTo(
  ZeebeClient,
  SERVICE_IDENTIFIER.camunda_client,
  [
    SERVICE_IDENTIFIER.zeebe_external_config,
    SERVICE_IDENTIFIER.camunda_external_client,
    SERVICE_IDENTIFIER.zeebe_elastic_exporter_config
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

// IoC.bindTo(ClientManager, SERVICE_IDENTIFIER.client_manager, [SERVICE_IDENTIFIER.camunda_client], null, false);
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

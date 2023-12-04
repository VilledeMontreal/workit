/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Worker } from '@villedemontreal/workit-core';
import { ICamundaService, IClient, IProcessHandler } from '@villedemontreal/workit-types';
import { inject, injectable, named } from 'inversify';
import { Client } from '../camunda-n-mq/client';
import { SERVICE_IDENTIFIER } from '../config/constants/identifiers';
import { TAG } from '../config/constants/tag';

@injectable()
export class CamundaBpmWorker extends Worker {
  constructor(
    @inject(SERVICE_IDENTIFIER.camunda_client) @named(TAG.camundaBpm) client: Client<IClient<ICamundaService>>,
    @inject(SERVICE_IDENTIFIER.process_handler) processHandler: IProcessHandler,
  ) {
    super(client, processHandler);
  }
}

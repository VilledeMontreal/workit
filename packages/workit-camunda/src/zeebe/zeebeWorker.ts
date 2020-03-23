/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { inject, injectable, named } from 'inversify';
import { Worker } from 'workit-core';
import { IClient, IProcessHandler } from 'workit-types';
import { Client } from '../camunda-n-mq/client';
import { SERVICE_IDENTIFIER } from '../config/constants/identifiers';
import { TAG } from '../config/constants/tag';

@injectable()
export class ZeebeWorker extends Worker {
  constructor(
    @inject(SERVICE_IDENTIFIER.camunda_client) @named(TAG.zeebe) client: Client<IClient>,
    @inject(SERVICE_IDENTIFIER.process_handler) processHandler: IProcessHandler
  ) {
    super(client, processHandler);
  }
}

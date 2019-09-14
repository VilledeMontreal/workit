/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { inject, injectable, named } from 'inversify';
import { SERVICE_IDENTIFIER } from '../../config/constants/identifiers';
import { TAG } from '../../config/constants/tag';
import { Client } from '../camunda-n-mq/client';
import { IClient } from '../camunda-n-mq/specs/client';
import { IProcessHandler } from '../core/processHandler/specs/processHandler';
import { Worker } from '../core/worker';

@injectable()
export class CamundaBpmWorker extends Worker {
  constructor(
    @inject(SERVICE_IDENTIFIER.camunda_client) @named(TAG.camundaBpm) client: Client<IClient>,
    @inject(SERVICE_IDENTIFIER.process_handler) processHandler: IProcessHandler
  ) {
    super(client, processHandler);
  }
}

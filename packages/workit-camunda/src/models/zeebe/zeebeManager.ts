/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { inject, injectable, named } from 'inversify';
import { IWorkflowClient } from 'workit-types';
import { SERVICE_IDENTIFIER } from '../../config/constants/identifiers';
import { TAG } from '../../config/constants/tag';
import { ClientManager } from '../camunda-n-mq/clientManager';

@injectable()
export class ZeebeManager extends ClientManager<IWorkflowClient> {
  constructor(@inject(SERVICE_IDENTIFIER.camunda_client) @named(TAG.zeebe) client: IWorkflowClient) {
    super(client);
  }
}

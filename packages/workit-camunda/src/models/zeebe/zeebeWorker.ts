import { inject, injectable, named } from 'inversify';
import { SERVICE_IDENTIFIER } from '../../config/constants/identifiers';
import { TAG } from '../../config/constants/tag';
import { Client } from '../camunda-n-mq/client';
import { IClient } from '../camunda-n-mq/specs/client';
import { IProcessHandler } from '../core/processHandler/specs/processHandler';
import { Worker } from '../core/worker';

@injectable()
export class ZeebeWorker extends Worker {
  constructor(
    @inject(SERVICE_IDENTIFIER.camunda_client) @named(TAG.zeebe) client: Client<IClient>,
    @inject(SERVICE_IDENTIFIER.success_strategy) processHandler: IProcessHandler
  ) {
    super(client, processHandler);
  }
}

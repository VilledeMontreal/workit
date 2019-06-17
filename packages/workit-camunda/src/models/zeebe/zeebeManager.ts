import { inject, injectable, named } from 'inversify';
import { SERVICE_IDENTIFIER } from '../../config/constants/identifiers';
import { TAG } from '../../config/constants/tag';
import { ClientManager } from '../camunda-n-mq/clientManager';
import { IWorkflowClient } from '../camunda-n-mq/specs/workflowClient';

@injectable()
export class ZeebeManager extends ClientManager<IWorkflowClient> {
  constructor(@inject(SERVICE_IDENTIFIER.camunda_client) @named(TAG.zeebe) client: IWorkflowClient) {
    super(client);
  }
}

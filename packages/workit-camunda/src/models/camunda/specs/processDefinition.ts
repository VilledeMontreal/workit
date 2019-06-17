export interface IProcessDefinition {
  id: string;
  key: string;
  category: string;
  description?: any;
  name: string;
  version: number;
  resource: string;
  deploymentId: string;
  diagram?: any;
  suspended: boolean;
  tenantId?: any;
  versionTag?: any;
  historyTimeToLive: number;
}

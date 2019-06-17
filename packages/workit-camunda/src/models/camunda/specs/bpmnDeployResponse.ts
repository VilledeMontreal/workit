interface IBpmnDeployResponse {
  links: ILink[];
  id: string;
  name: string;
  source: string;
  deploymentTime: string;
  tenantId?: any;
  deployedProcessDefinitions: IDeployedProcessDefinitions;
  deployedCaseDefinitions?: any;
  deployedDecisionDefinitions?: any;
  deployedDecisionRequirementsDefinitions?: any;
}

interface IDeployedProcessDefinitions {
  [cusom: string]: IBpmn;
}

interface IBpmn {
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
  startableInTasklist: boolean;
}

interface ILink {
  method: string;
  href: string;
  rel: string;
}

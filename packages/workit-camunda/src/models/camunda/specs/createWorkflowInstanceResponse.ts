export interface ICreateWorkflowInstanceResponse {
  links: ILink[];
  id: string;
  definitionId: string;
  businessKey?: any;
  caseInstanceId?: any;
  ended: boolean;
  suspended: boolean;
  tenantId?: any;
}

interface ILink {
  method: string;
  href: string;
  rel: string;
}

export interface IIncident {
  id: string;
  processDefinitionId: string;
  processInstanceId: string;
  executionId: string;
  incidentTimestamp: string;
  incidentType: string;
  activityId: string;
  causeIncidentId: string;
  rootCauseIncidentId: string;
  configuration: string;
  incidentMessage?: string | null;
  tenantId?: string | null;
  jobDefinitionId?: string | null;
}

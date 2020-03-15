/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IVariableObject {
  type: string;
  value: string;
  valueInfo: any;
}
export interface IVariable {
  [custom: string]: any;
}
export interface IVariablePayload {
  activityId: string;
  activityInstanceId: string;
  errorMessage: string | null;
  errorDetails: any;
  executionId: string;
  id: string;
  lockExpirationTime: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  processInstanceId: string;
  retries: number | null;
  suspended: boolean;
  workerId: string;
  topicName: string;
  tenantId: string | null;
  variables: IVariable;
  priority: number;
  businessKey: string | null;
}

/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IWorkflowPropsBase {
  activityId: string;
  jobKey: string;
  processInstanceId: string;
  workflowKey: string;
  workflowInstanceKey: string;
  workflowDefinitionVersion: number;
  bpmnProcessId: string;
  retries: number | null;
  lockExpirationTime: Date;
  topicName: string;
  workerId: string;
  [custom: string]: any;
}

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

export interface IWorkflowDeployResponse extends IWorkflowResponse {
  key: string;
}

export interface IWorkflow {
  bpmnProcessId: string;
  version: number;
  workflowKey: string;
  resourceName: string;
}

export interface IWorkflowResponse {
  workflows: IWorkflow[];
}

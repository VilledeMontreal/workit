/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IWorkflowDeployResponse {
  key: string;
  workflows: IWorkflow[];
}

export interface IWorkflow {
  bpmnProcessId: string;
  version: number;
  workflowKey: string;
  resourceName: string;
}

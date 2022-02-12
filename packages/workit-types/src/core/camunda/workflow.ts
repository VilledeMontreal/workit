/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IWorkflow {
  bpmnProcessId: string;
  workflowKey: string;
  resourceName: string;
  version: number;
}

/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ICreateWorkflowInstanceResponse {
  workflowKey: string;
  bpmnProcessId: string;
  version: number;
  workflowInstanceKey: string;
}

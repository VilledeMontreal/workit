/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export interface IWorkflow {
  id: string;
  key: number;
  partitionId: number;
  name: string;
  version: number;
  bpmnProcessId: string;
  bpmnXml: string;
  resourceName: string;
}

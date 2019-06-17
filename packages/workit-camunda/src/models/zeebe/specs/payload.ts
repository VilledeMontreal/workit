// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
export interface IJobHeader {
  workflowInstanceKey: string;
  bpmnProcessId: string;
  workflowDefinitionVersion: number;
  workflowKey: string;
  elementId: string;
  elementInstanceKey: string;
}

export interface IEmptyPayload {
  key: string;
  type: string;
  jobHeaders: IJobHeader;
  worker: string;
  retries: number | null;
  deadline: string;
  customHeaders: any;
  [custom: string]: any;
}

export interface IPayload<T = any> extends IEmptyPayload {
  payload: T;
}

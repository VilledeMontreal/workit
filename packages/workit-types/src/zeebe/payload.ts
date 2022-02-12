/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IEmptyPayload<TProps> {
  key: string;
  type: string;
  workflowInstanceKey: string;
  bpmnProcessId: string;
  workflowDefinitionVersion: number;
  workflowKey: string;
  elementId: string;
  elementInstanceKey: string;
  worker: string;
  retries: number | null;
  deadline: string;
  customHeaders: TProps;
}

export interface IPayload<TVariables = any, TProps = any> extends IEmptyPayload<TProps> {
  variables: TVariables;
}

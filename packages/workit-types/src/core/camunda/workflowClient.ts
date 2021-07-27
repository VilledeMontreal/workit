/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IPagination } from '../../commons/pagination';
import { IPaginationOptions } from '../../commons/paginationOptions';
import { ICreateWorkflowInstance } from './createWorkflowInstance';
import { ICreateWorkflowInstanceResponse } from './createWorkflowInstanceResponse';
import { IDeployWorkflowResponse } from './deployWorkflowResponse';
import { IPublishMessage } from './publishMessage';
import { IUpdateWorkflowRetry } from './updateWorkflowRetry';
import { IUpdateWorkflowVariables } from './updateWorkflowVariables';
import { IWorkflow } from './workflow';
import { IWorkflowDefinition, IWorkflowDefinitionRequest } from './workflowDefinition';
import { IWorkflowOptions } from './workflowOptions';

export interface IWorkflowClient {
  deployWorkflow(absPath: string): Promise<Readonly<IDeployWorkflowResponse>>;
  getWorkflows(options?: Partial<IWorkflowOptions & IPaginationOptions>): Promise<IPagination<IWorkflow>>;
  updateVariables(payload: IUpdateWorkflowVariables): Promise<void>;
  updateJobRetries(payload: IUpdateWorkflowRetry): Promise<void>;
  publishMessage<T = unknown>(payload: IPublishMessage<T, unknown>): Promise<void>;
  cancelWorkflowInstance(instance: number | string): Promise<void>;
  createWorkflowInstance<T = unknown>(payload: ICreateWorkflowInstance<T>): Promise<ICreateWorkflowInstanceResponse>;
  resolveIncident(incidentKey: string): Promise<void>;
  getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition>;
}

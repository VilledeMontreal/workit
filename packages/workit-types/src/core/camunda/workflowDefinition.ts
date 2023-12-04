/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IWorkflowDefinition extends IWorkflowProcessIdDefinition, IWorkflowDefinitionKey {
  version: number;
  resourceName: string;
  bpmnXml: string;
}

export type IWorkflowDefinitionRequest = IWorkflowProcessIdDefinition | IWorkflowDefinitionKey;

export interface IWorkflowProcessIdDefinition {
  /**
   * Warning: Camunda BPM platform is not compatible with "version" property due to API restriction,
   * please use workflowKey. Because workflowKey includes "version" in Camunda BPM plateform
   */
  version?: number;

  /**
   * See your BPMN process id on your BPMN file
   *
   * Example:
   * - CamundaBPM: "DEMO" not compatible with version property due to API restriction, please use workflowKey
   */
  bpmnProcessId: string;
}

export interface IWorkflowDefinitionKey {
  /**
   * Example:
   * - CamundaBPM: "DEMO:2:weqw-qweweqw-fhdjfh-sjjss"
   */
  workflowKey: string;
}

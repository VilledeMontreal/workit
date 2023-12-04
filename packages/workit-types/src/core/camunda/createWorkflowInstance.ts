/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ICreateWorkflowInstance<T = unknown> {
  // CamundaBPM can set process Definition id or key, since id include version, you don't need to set the version property.
  // In case you pass the definition key, the latest version of the bpmn will receive the instance.
  // Example:
  // CamundaBPM: bpmnProcessId can be "DEMO:2:dahjs-asdkjh-wqieq-wwwq" or "DEMO"
  bpmnProcessId: string;
  // Not used in camundaBpm due to API restriction and it's included in process Definition Id
  version?: number;
  variables: T;
}

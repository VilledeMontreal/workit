/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ICreateWorkflowInstance<T = any> {
  // CamundaBPM can set process Definition id or key, since id include version, you don't need to set the version property.
  // In case you pass the definition key, the latest version of the bpmn will receive the instance.
  // For Zeebe, only the key is supported and you must use the version property in order to send instance to the proper workflow
  // Example:
  // CamundaBPM: bpmnProcessId can be "DEMO:2:dahjs-asdkjh-wqieq-wwwq" or "DEMO"
  // Zeebe: "DEMO" and use version property to target the right workflow version.
  bpmnProcessId: string;
  // Not used in camundaBpm due to API restriction and it's included in process Definition Id
  version?: number;
  variables: T;
}

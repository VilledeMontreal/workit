/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Descriptor for a deployment in the Camunda BPM engine.
 */
export interface IBpmDeployment {
  id: string;
  name: string;
  source: string;
  tenantId: string;
  deploymentTime: Date;
}

/**
 * Descriptor for a deployment's resource.
 */
export interface IBpmDeploymentResource {
  id: string;
  name: string;
  deploymentId: string;
}

export interface IWorkflowDeployment {
  getDeployments(): Promise<IBpmDeployment[]>;
  getDeploymentResourceList(deploymentId: string): Promise<IBpmDeploymentResource[]>;
  getDeploymentResource(deploymentId: string, resourceId: string): Promise<Buffer>;
  deleteDeployment(deploymentId: string): Promise<void>;
}

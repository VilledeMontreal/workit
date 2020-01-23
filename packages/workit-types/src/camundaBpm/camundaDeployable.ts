/*!
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IHttpResponse } from '../http/httpResponse';
import { IDeployment, IDeploymentResource } from './bpmnDeployResponse';

/**
 * Mixin interface exposing deployment functionality.
 */
export interface ICamundaDeployable {
  getDeployments(options?: { params: {} }): Promise<IHttpResponse<IDeployment[]>>;
  getDeploymentResourceList(
    deploymentId: string,
    options?: { params: {} }
  ): Promise<IHttpResponse<IDeploymentResource[]>>;
  getDeploymentResource(
    deploymentId: string,
    resourceId: string,
    options?: { params: {} }
  ): Promise<IHttpResponse<Buffer>>;
  deleteDeployment(deploymentId: string, options?: { params: {} }): Promise<IHttpResponse<void>>;
}

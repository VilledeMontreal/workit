/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IWorkflowResponse } from './workflowResponse';

export interface IDeployWorkflowResponse extends IWorkflowResponse {
  key: string;
}

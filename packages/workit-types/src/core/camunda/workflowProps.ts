/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ICustomHeaders } from '../../commons/customHeaders';
import { IWorkflowPropsBase } from './workflowPropsBase';

export interface IWorkflowProps<T = ICustomHeaders> extends Readonly<IWorkflowPropsBase> {
  customHeaders: T;
}

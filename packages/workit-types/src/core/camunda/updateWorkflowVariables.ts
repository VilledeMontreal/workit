/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IUpdateWorkflowVariables<T = unknown> {
  processInstanceId: string;
  variables: T;
  local?: boolean;
}

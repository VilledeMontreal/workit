/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ILink } from './link';

export interface IBpmnDeployResponse {
  links: ILink[];
  id: string;
  name: string;
  source: string;
  deploymentTime: string;
  tenantId?: string;
  deployedProcessDefinitions: IDeployedProcessDefinitions;
  deployedCaseDefinitions?: string;
  deployedDecisionDefinitions?: any;
  deployedDecisionRequirementsDefinitions?: any;
}

export interface IDeployedProcessDefinitions {
  [cusom: string]: IBpmn;
}

export interface IBpmn {
  id: string;
  key: string;
  category: string;
  description?: string;
  name: string;
  version: number;
  resource: string;
  deploymentId: string;
  diagram?: any;
  suspended: boolean;
  tenantId?: string;
  versionTag?: any;
  historyTimeToLive: number;
  startableInTasklist: boolean;
}

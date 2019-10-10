/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IProcessDefinition {
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
}

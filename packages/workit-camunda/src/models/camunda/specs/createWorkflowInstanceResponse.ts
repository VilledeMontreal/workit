/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ICreateWorkflowInstanceResponse {
  links: ILink[];
  id: string;
  definitionId: string;
  businessKey?: any;
  caseInstanceId?: any;
  ended: boolean;
  suspended: boolean;
  tenantId?: any;
}

interface ILink {
  method: string;
  href: string;
  rel: string;
}

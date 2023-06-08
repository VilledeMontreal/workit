/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ILink } from './link';

export interface ICamundaBpmCreateInstanceResponse {
  links: ILink[];
  id: string;
  definitionId: string;
  businessKey?: string;
  caseInstanceId?: string;
  ended: boolean;
  suspended: boolean;
  tenantId?: string;
}

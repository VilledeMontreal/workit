/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ISubscriptionOptions<T = any> {
  /**
   * Defines a subset of variables available in the handler.
   */
  variables: T[];
  /**
   * A value which allows to filter tasks based on process instance business key
   */
  businessKey: string;
  /**
   * A value which allows to filter tasks based on process definition id
   */
  processDefinitionId: string;
  /**
   * A value which allows to filter tasks based on process definition ids
   */
  processDefinitionIdIn: string;
  /**
   * A value which allows to filter tasks based on process definition key
   */
  processDefinitionKey: string;
  /**
   * A value which allows to filter tasks based on process definition keys
   */
  processDefinitionKeyIn: string;
  /**
   * A value which allows to filter tasks based on tenant ids
   */
  withoutTenantId: string;
  /**
   * A value which allows to filter tasks without tenant id
   */
  tenantIdIn: string;
}

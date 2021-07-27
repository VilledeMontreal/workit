/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ISubscriptionOptions<T = unknown> {
  /**
   * Defines a subset of variables available in the handler.
   */
  variables: (keyof T)[];
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
   * A value which allows to filter tasks based on process definition Version Tag
   */
  processDefinitionVersionTag: string;
  /**
   * A JSON object used for filtering tasks based on process instance variable values. A property name of the object represents a process variable name, while the property value represents the process variable value to filter tasks by.
   */
  processVariables: Partial<T>;
  /**
   * A value which allows to filter tasks based on tenant ids
   */
  withoutTenantId: string;
  /**
   * A value which allows to filter tasks without tenant id
   */
  tenantIdIn: string;
}

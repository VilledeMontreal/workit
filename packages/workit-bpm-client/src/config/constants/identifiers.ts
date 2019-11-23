/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from 'workit-core';

export const SERVICE_IDENTIFIER = {
  ...CORE_IDENTIFIER,
  /**
   * Bind auth info for your Camunda server
   * Check tests for more info
   */
  camunda_oauth_info: Symbol('camunda_oauth'),
  /**
   * Bind the Camunda repository that standard REST API
   */
  camunda_repository: Symbol('camunda_repository'),
  /**
   * Bind the Camunda service that use the camunda_repository service identifier
   */
  camunda_service: Symbol('camunda_service'),
  /**
   * Bind the Generic Camunda client you want to use
   */
  camunda_client: Symbol('camunda_client'),
  /**
   * Bind the Camunda BPMN Workflow Engine client you want to use (for external tasks)
   */
  camunda_external_client: Symbol('camunda_external_client'),
  /**
   * Bind the Camunda BPMN Workflow Engine configuration
   */
  camunda_external_config: Symbol('camunda_external_config'),
  /**
   * Bind your own config for Camunda system
   */
  camunda_config: Symbol('camunda_config')
};

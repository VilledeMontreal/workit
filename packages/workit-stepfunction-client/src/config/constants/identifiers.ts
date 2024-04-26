/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '@villedemontreal/workit-core';

export const SERVICE_IDENTIFIER = {
  ...CORE_IDENTIFIER,
  /**
   * Bind the Camunda repository
   */
  camunda_repository: Symbol('camunda_repository'),
  /**
   * Bind the Step function repository
   */
  stepfunction_repository: Symbol('stepfunction_repository'),
  /**
   * Bind the Generic client you want to use
   */
  camunda_client: Symbol('camunda_client'),
  /**
   * Bind the SQS configuration
   */
  sqs_config: Symbol('sqs_config'),
  /**
   * Bind your own step function configuration
   */
  stepfunction_config: Symbol('stepfunction_config'),
};

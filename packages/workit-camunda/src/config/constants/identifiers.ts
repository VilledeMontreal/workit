/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export const SERVICE_IDENTIFIER = {
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
   * Bind the Zeebe client you want to use
   */
  zeebe_external_client: Symbol('zeebe_external_client'),
  /**
   * Bind the Zeebe config you want to use
   */
  zeebe_external_config: Symbol('zeebe_external_config'),
  /**
   * Bind your own generic client [[Client<IClient>]]
   */
  client: Symbol('client'),
  /**
   * Bind your own client manager [[ClientManager<IClient>]]
   */
  client_manager: Symbol('client_manager'),
  /**
   * Bind your own config for Camunda system
   */
  camunda_config: Symbol('camunda_config'),
  /**
   * Bind your own config for Zeebe system
   */
  zeebe_config: Symbol('zeebe_config'),
  /**
   * Bind your own Elastic exporter config for Zeebe
   */

  zeebe_elastic_exporter_config: Symbol('zeebe_elastic_exporter_config'),
  /**
   * You can bind your own logger.
   */
  logger: Symbol('logger'),
  /**
   * You can bind your own strategy by implmenting IFailureStrategy interface.
   */
  failure_strategy: Symbol('failureStrategy'),
  /**
   * You can bind your own strategy by implementing ISuccessStrategy interface.
   */
  success_strategy: Symbol('successStrategy'),
  /**
   * You can bind your own process handler by implementing IProcessHandler interface.
   * Default is provided.
   */

  process_handler: Symbol('process_handler'),
  /**
   * Config to pass to the process handler
   */
  process_handler_config: Symbol('process_handler_config'),
  /**
   * You can get a new worker by using IoC
   * e.g IoC.get<Worker>(SERVICE_IDENTIFIER.worker);
   */
  worker: Symbol('Worker'),

  /**
   * Pass your custom tracer in order to trace your worker.
   * See more on opencensus web site.
   * "CustomTracer" must be bound in the IoC defaul is a NoopTracer
   */
  tracer: Symbol('tracer')
};

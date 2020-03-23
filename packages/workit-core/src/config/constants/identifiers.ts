/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export const SERVICE_IDENTIFIER = {
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
   * Pass your custom tracer or [NodeTracer](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-node/src/NodeTracer.ts#L25) in order to trace operations in your worker.
   * `NodeTracer` must be bound in the IoC defaul is a [NoopTracer](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-api/src/trace/NoopTracer.ts#L25)
   */
  tracer: Symbol('tracer'),
  /**
   * Pass your custom propagator in order to get traceId from Camunda platform.
   * "TracerPropagator" must be bound in the IoC defaul is a NoopTracerPropagator
   */
  tracer_propagator: Symbol('tracer_propagator')
};

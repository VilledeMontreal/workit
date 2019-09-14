/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Span, TracerBase } from '@opencensus/core';
import { JaegerTraceExporter } from '@opencensus/exporter-jaeger';
import * as tracing from '@opencensus/nodejs';
import { ITracerServiceOptions } from '../specs/tracerServiceOptions';
import { SimpleFormat } from './simpleFormat';

const rootPath = process.cwd();
let packageInfo = { name: 'unknowService', version: 'unknowVersion' };
try {
  packageInfo = require(`${rootPath}/package.json`);
} catch {
  // todo: add debug log
}

const dispose = () => {
  if (tracing.active) {
    tracing.stop();
  }
};

process.on('exit', dispose);
process.on('SIGINT', dispose);

const xCorrelationkey = 'x-correlation-id';
const baggagePublicReqId = 'vdmctx-public-req-id';

export class JaegerTracerService {
  private _configs: any;
  constructor(
    tracerOptions?: Partial<ITracerServiceOptions>,
    pluginOptions?: { [pluginName: string]: string | unknown }
  ) {
    const defaultConfig = {
      maxPacketSize: 65000,
      serviceName: packageInfo.name,
      tags: [{ key: 'serviceVersion', value: packageInfo.version }]
    };
    const exporterOptions = Object.assign(defaultConfig, tracerOptions);

    const ingoreUrls = [/\/external\-task\/fetchAndLock/i];
    const pluginConfigs = {
      http: {
        module: '@opencensus/instrumentation-http',
        config: {
          ignoreIncomingPaths: ingoreUrls,
          ignoreOutgoingUrls: ingoreUrls,
          applyCustomAttributesOnSpan: (span: Span, request: any, response: any) => {
            const headers = request.headers;
            if (headers) {
              span.addAttribute(xCorrelationkey, headers[xCorrelationkey]);
              const reqIdValue = headers[baggagePublicReqId];
              if (reqIdValue) {
                span.addAttribute(baggagePublicReqId.replace('vdmctx-', ''), reqIdValue);
              }
            }
          }
        }
      },
      https: '@opencensus/instrumentation-https',
      grpc: ''
    };

    this._configs = {
      logLevel: 0,
      bufferTimeout: 3000,
      bufferSize: 30000,
      exporter: new JaegerTraceExporter(exporterOptions),
      propagation: new SimpleFormat(),
      plugins: Object.assign(pluginConfigs, pluginOptions)
    };
  }

  public getTracer(): TracerBase {
    return tracing.tracer;
  }

  public dispose(): void {
    if (!tracing.active) {
      return;
    }
    try {
      tracing.stop();
    } catch {
      //
    }
  }

  public start(): void {
    if (tracing.active) {
      return;
    }

    tracing.start(this._configs);
  }
}

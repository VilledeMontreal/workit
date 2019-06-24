// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { injectable, multiInject } from 'inversify';
import { SERVICE_IDENTIFIER } from '../../../config/constants/identifiers';
import { IMessage } from '../../camunda-n-mq/specs/message';
import { APM } from './enums/apm';
import { ICamundaClientInstrumentation } from './specs/camundaClientInstrumentation';
import { ICCInstrumentationHandler } from './specs/instrumentation';

import 'reflect-metadata';

@injectable()
export class Instrumentation implements ICCInstrumentationHandler {
  private _probes: ICamundaClientInstrumentation[];
  constructor(@multiInject(SERVICE_IDENTIFIER.instrumentation_camunda_client) probes: ICamundaClientInstrumentation[]) {
    this._probes = probes;
  }
  get kind(): string {
    return 'handler';
  }
  public get(kind: APM): ICamundaClientInstrumentation | undefined {
    const probe = this._probes.find(p => p.kind === kind);
    if (!probe) {
      throw new Error(
        `You must provide some sort of Noop${kind} implementation which can be used to flag-control instrumentation or inject something harmless for tests (et cetera)`
      );
    }
    return probe;
  }
  public onMessageFailed(e: Error, message: IMessage<any, any>): void {
    this._probes.forEach(probe => probe.onMessageFailed(e, message));
  }
  public onMessageSuccess(message: IMessage<any, any>): void {
    this._probes.forEach(probe => probe.onMessageSuccess(message));
  }
}

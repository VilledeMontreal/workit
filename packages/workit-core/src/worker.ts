/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { EventEmitter } from 'events';
import { injectable, unmanaged } from 'inversify';
import 'reflect-metadata';
import { IClient, IProcess, IProcessHandler } from 'workit-types';

import debug = require('debug');

const log = debug('workit:worker');

@injectable()
export class Worker extends EventEmitter implements IProcess {
  protected readonly _processHandler: IProcessHandler;

  protected readonly _client: IClient;

  constructor(@unmanaged() client: IClient, @unmanaged() processHandler: IProcessHandler) {
    super();
    this._client = client;
    this._processHandler = processHandler;
  }

  public start(): void {
    log('starting worker');
    this.emit('starting');
    log('started worker');
  }

  public run(): Promise<void> {
    log('running worker');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return this._client.subscribe(this._processHandler.handle);
  }

  public async stop(): Promise<void> {
    this.emit('stopping');
    await this._client.unsubscribe();
    this.emit('stopped');
  }

  public getProcessHandler(): IProcessHandler {
    return this._processHandler;
  }
}

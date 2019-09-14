/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import debug = require('debug');
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { SERVICE_IDENTIFIER } from '../../config/constants/identifiers';
import { ICamundaService } from './specs/camundaService';
import { IClient } from './specs/client';
import { IMessage } from './specs/message';
const log = debug('workit:clientBase');
@injectable()
export class Client<TClient extends IClient> {
  protected _onMessageReceived!: (message: IMessage, service: ICamundaService) => Promise<void>;
  protected readonly _client: TClient;
  constructor(@inject(SERVICE_IDENTIFIER.camunda_client) client: TClient) {
    this._client = client;
  }
  public async subscribe(handler: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void> {
    if (handler != null) {
      this._onMessageReceived = handler;
      await this.startSubscriber();
    }
  }

  public async unsubscribe(): Promise<void> {
    await this.execute(x => x.unsubscribe());
  }
  private async execute(
    action: (client: TClient) => Promise<void>,
    onException?: (client: TClient) => Promise<void>
  ): Promise<void> {
    try {
      return await action(this._client);
    } catch (ex) {
      log(ex.message);
      if (onException) {
        return await onException(this._client);
      }
    }
  }
  private async startSubscriber(): Promise<void> {
    if (this._client != null) {
      await this.execute(x => x.subscribe(this._onMessageReceived));
    }
  }
}

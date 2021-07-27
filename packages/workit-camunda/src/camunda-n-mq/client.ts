/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IClient, IMessage } from 'workit-types';
import { SERVICE_IDENTIFIER } from '../config/constants/identifiers';

@injectable()
export class Client<TClient extends IClient> {
  protected _onMessageReceived!: (message: IMessage, service: unknown) => Promise<void>;

  protected readonly _client: TClient;

  constructor(@inject(SERVICE_IDENTIFIER.camunda_client) client: TClient) {
    this._client = client;
  }

  public async subscribe(handler: (message: IMessage, service: unknown) => Promise<void>): Promise<void> {
    if (handler != null) {
      this._onMessageReceived = handler;
      await this._startSubscriber();
    }
  }

  public async unsubscribe(): Promise<void> {
    await this._execute((x) => x.unsubscribe());
  }

  private async _execute(
    action: (client: TClient) => Promise<void>,
    onException?: (client: TClient) => Promise<void>
  ): Promise<void> {
    try {
      return await action(this._client);
    } catch (ex) {
      if (!onException) {
        return Promise.resolve();
      }
      return onException(this._client);
    }
  }

  private async _startSubscriber(): Promise<void> {
    if (this._client != null) {
      await this._execute((x) => x.subscribe(this._onMessageReceived));
    }
  }
}

/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IAPIConfig } from '../../specs/apiConfig';

export enum Env {
  local = 'local',
  dev = 'development',
  accept = 'acceptation',
  prod = 'production',
}

export class Configs {
  private readonly _elastic: IAPIConfig;

  constructor(customConfig?: Partial<IAPIConfig>) {
    this._elastic = {
      url: `http://localhost:9200`,
      endpoints: {
        workflows: '/operate-workflow_alias',
      },
      retry: 3,
      timeout: 30000,
      ...customConfig,
    } as IAPIConfig;
  }

  public get elastic() {
    return this._elastic;
  }
}

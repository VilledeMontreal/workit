/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IIoC, ILogger, IPlugin, IPluginConfig } from '@villedemontreal/workit-types';

// TODO: add bpmn files and failures/success strategies as well

export abstract class BasePlugin implements IPlugin {
  public supportedVersions?: string[];

  public abstract readonly moduleName: string;

  public readonly version?: string;

  protected _ioc!: IIoC;

  protected _logger!: ILogger;

  protected _config!: IPluginConfig;

  constructor(protected readonly packageName: string) { }

  public enable(ioc: IIoC, logger: ILogger, config?: IPluginConfig): void {
    this._ioc = ioc;
    this._logger = logger;
    if (config) this._config = config;
    this.bind();
  }

  public disable(): void {
    this.unbind();
  }

  protected abstract bind(): void;

  protected abstract unbind(): void;
}

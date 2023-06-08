/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IIoC } from '../core/ioc';
import { ILogger } from '../commons/logger';
import { IPluginConfig } from './pluginConfig';

export interface IPlugin {
  /**
   * Contains all supported versions.
   * All versions must be compatible with [semver](https://semver.org/spec/v2.0.0.html) format.
   * If the version is not supported, we won't apply tasks (see `enable` method).
   * If omitted, all versions of the module will be used.
   * NOT IMPLEMENTED YET
   */
  supportedVersions?: string[];

  /**
   * Name of the module.
   */
  moduleName: string;

  /**
   * Method that enables the tasks.
   * @param ioc ioc that let you bind tasks among other objects
   * @param logger a logger instance.
   * @param [config] an object to configure the plugin.
   */
  enable(ioc: IIoC, logger: ILogger, config?: IPluginConfig): void;

  /** Method to disable the tasks  */
  disable(): void;
}

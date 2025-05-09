/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IPluginConfig } from './pluginConfig';

export interface IPlugins {
  [pluginName: string]: IPluginConfig;
}

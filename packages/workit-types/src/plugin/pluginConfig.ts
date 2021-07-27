/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export interface IPluginConfig {
  /**
   * Whether to enable the plugin.
   * @default true
   */
  enabled?: boolean;

  /**
   * Path of the trace plugin to load.
   */
  path?: string;
}

/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export const SERVICE_IDENTIFIER = {
  /**
   * Bind the Zeebe client you want to use
   */
  zeebe_external_client: Symbol('zeebe_external_client'),
  /**
   * Bind the Zeebe config you want to use
   */
  zeebe_external_config: Symbol('zeebe_external_config'),
  /**
   * Bind your own config for Zeebe system
   */
  zeebe_config: Symbol('zeebe_config'),
  /**
   * Bind your own Elastic exporter config for Zeebe
   */
  zeebe_elastic_exporter_config: Symbol('zeebe_elastic_exporter_config'),
};

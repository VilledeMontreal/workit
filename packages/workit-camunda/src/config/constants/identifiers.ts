/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CAMUNDA_BPM_IDENTIFIER } from '@villedemontreal/workit-bpm-client';
import { SERVICE_IDENTIFIER as ZEEBE_IDENTIFIER } from '@villedemontreal/workit-zeebe-client';

export const SERVICE_IDENTIFIER = {
  ...CAMUNDA_BPM_IDENTIFIER,
  ...ZEEBE_IDENTIFIER,
  /**
   * Bind the Generic Camunda client you want to use
   */
  camunda_client: Symbol('camunda_client'),

  /**
   * Bind your own generic client [[Client<IClient>]]
   */
  client: Symbol('client'),
  /**
   * Bind your own client manager [[ClientManager<IClient>]]
   */
  client_manager: Symbol('client_manager'),
  /**
   * Bind your own config for Camunda system
   */
  camunda_config: Symbol('camunda_config'),
};

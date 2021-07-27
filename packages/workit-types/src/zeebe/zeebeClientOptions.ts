/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Loglevel } from '../commons/logLevel';

export interface IZeebeClientOptions {
  loglevel: Loglevel;
  stdout: any;
}

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IZeebeClientOptions } from './zeebeClientOptions';
import { IZeebeWorkerOptions } from './zeebeWorkerOptions';

export interface IZeebeOptions extends Partial<IZeebeWorkerOptions>, Partial<IZeebeClientOptions> {
  /**
   * Url to connect e.g localhost:26500
   */
  baseUrl: string;
  /**
   * Unique worker name
   */
  workerId: string;
  /**
   * Topic name to subscribe
   */
  topicName: string;
}

/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

// TODO: remove any
export interface ITracerServiceOptions {
  serviceName: string;
  tags: any[];
  host: string;
  port: number;
  maxPacketSize: number;
}

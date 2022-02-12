/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IHeaders } from './headers';

/**
 * https://www.npmjs.com/package/axios#response-schema
 */
export interface IHttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: IHeaders;

  [custom: string]: any;
}

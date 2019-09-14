/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IHeaders } from './headers';
import { IResponse } from './response';

export interface IEndpoints {
  workflows: string;
}

export interface IAPIConfig {
  url: string;
  retry: number;
  endpoints: IEndpoints;
  timeout: number;
  interceptors: Partial<IInterceptors>;
}

/**
 * https://www.npmjs.com/package/axios#request-config
 */
export interface IRequestConfig {
  headers: IHeaders;
  timeout: number;
  [custom: string]: any;
}

export interface IInterceptors {
  request: ((config: IRequestConfig) => IRequestConfig)[];
  response: (((value: IResponse<any>) => IResponse<any> | Promise<IResponse<any>>) | undefined)[];
}

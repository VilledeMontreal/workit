import { IHeaders } from './headers';

/**
 * https://www.npmjs.com/package/axios#response-schema
 */
export interface IResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: IHeaders;

  [custom: string]: any;
}

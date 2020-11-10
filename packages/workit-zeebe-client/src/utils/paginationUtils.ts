/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IPaginationOptions, IPaging, IWorkflowOptions } from 'workit-types';

class PaginationUtils {
  public static setElasticPaginationParams<T = any>(
    params: T,
    options?: Partial<IWorkflowOptions & IPaginationOptions>
  ) {
    if (!options) {
      return params;
    }
    return { ...params, from: options.from, size: options.size };
  }

  public static getPagingFromOptions(totalCount: number, options?: Partial<IPaginationOptions>): IPaging {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-from-size.html
    if (!options) {
      return {
        from: 0,
        size: PaginationUtils._DEFAULT_SIZE_ITEMS,
        totalCount,
      };
    }
    return {
      from: typeof options.from === 'number' ? options.from : 0,
      size: options.size || PaginationUtils._DEFAULT_SIZE_ITEMS,
      totalCount,
    };
  }

  private static _DEFAULT_SIZE_ITEMS = 500;
}

export { PaginationUtils };

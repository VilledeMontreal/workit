/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IPaginationOptions, IPaging, IWorkflowOptions } from 'workit-types';

export class PaginationUtils {
  public static setElasticPaginationParams<T = any>(
    params: T,
    options?: Partial<IWorkflowOptions & IPaginationOptions>
  ) {
    if (!options) {
      return params;
    }
    return Object.assign({}, params, { from: options.from, size: options.size });
  }

  public static getPagingFromOptions(totalCount: number, options?: (any & IPaginationOptions) | undefined): IPaging {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-from-size.html
    if (!options) {
      return {
        from: 0,
        size: PaginationUtils.DEFAULT_SIZE_ITEMS,
        totalCount
      };
    }
    return {
      from: typeof options.from === 'number' ? options.from : 0,
      size: options.size || PaginationUtils.DEFAULT_SIZE_ITEMS,
      totalCount
    };
  }

  private static DEFAULT_SIZE_ITEMS = 500;
}

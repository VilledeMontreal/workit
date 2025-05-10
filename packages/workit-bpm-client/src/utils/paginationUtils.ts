/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
/* eslint @typescript-eslint/no-redundant-type-constituents: 0 */

import { IPaginationOptions, IPaging, IWorkflowOptions } from '@villedemontreal/workit-types';

export class PaginationUtils {
  public static setCamundaBpmPaginationParams<T = any>(
    params: T,
    options?: Partial<IWorkflowOptions & IPaginationOptions>,
  ) {
    if (!options) {
      return params;
    }
    // make no sens to set size to 0
    return { ...params, firstResult: options.from, maxResults: options.size || PaginationUtils._DEFAULT_SIZE_ITEMS };
  }

  public static getPagingFromOptions(totalCount: number, options?: (any & IPaginationOptions) | undefined): IPaging {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-from-size.html
    if (!options) {
      return {
        from: 0,
        size: PaginationUtils._DEFAULT_SIZE_ITEMS,
        totalCount,
      };
    }
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      from: typeof options.from === 'number' ? options.from : 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      size: options.size || PaginationUtils._DEFAULT_SIZE_ITEMS,
      totalCount,
    };
  }

  private static _DEFAULT_SIZE_ITEMS = 500;
}

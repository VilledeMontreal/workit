/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IElasticDocument } from './elasticDocument';

export interface IElasticResponse<T> {
  took: number;
  timed_out: boolean;
  _shards: IShards;
  hits: IHits<T>;
}

interface IHits<T> {
  total: number;
  max_score: number | null;
  hits: IElasticDocument<T>[];
}

interface IShards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

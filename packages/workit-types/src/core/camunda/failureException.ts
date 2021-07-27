/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export class FailureException extends Error {
  constructor(message?: string, public retries: number = 1, public retryTimeout: number = 1000) {
    super(message);
  }
}

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
export class IncidentException extends Error {
  constructor(message?: string) {
    super(message);
  }

  get retries() {
    return 0;
  }
}

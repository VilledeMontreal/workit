/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export interface ISqsConfig {
  queueUrl: string;
  waitTimeSeconds?: number;
  /**
   * By default true, the consumer will NOT treat an empty object or array from either of the handlers as a acknowledgement of no messages and will delete those messages as a result. Set this to false to not always acknowledge all messages no matter the returned value.
   * We let the step function acknowledgement decide to requeue a message or not
   */
  alwaysAcknowledge?: boolean;
}

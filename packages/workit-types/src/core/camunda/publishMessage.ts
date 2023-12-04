/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IPublishMessage<T, K> {
  /** Should match the "Message Name" in a BPMN Message  */
  name: string;
  /* The value to match with the field specified as "Subscription Correlation Key" in BPMN
   * It's the correlationKeys for the bpmn platform.
   */
  correlation: K;
  /**
   * Unique ID for this message.
   * It's the processInstanceId in the bpmn plateform. Optional if it's a message start event.
   */
  messageId?: string;
  variables: T;
}

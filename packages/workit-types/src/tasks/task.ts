/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '../core/message';

export interface ITask<I> {
  readonly name: string;
  /**
   * All your business logic related to the task should be executed here.
   * A task tends to be a controller, so you can inject services among other things in the ctor
   */
  execute(model: I): Promise<IMessage>;
}

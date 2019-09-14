/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 *
 *     Licensed under the MIT license.
 *     See LICENSE file in the project root for full license information.
 */

// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { injectable } from 'inversify';
import 'reflect-metadata';
import { IMessage } from '../../camunda-n-mq/specs/message';
import { ITask } from './task';

@injectable()
export abstract class TaskBase<I> implements ITask<I> {
  public get name() {
    return this.constructor.name;
  }

  /**
   * All your business logic related to the task should be executed here.
   * A task tends to be a controller, so you can inject services among other things in the ctor
   */
  public abstract async execute(model: I): Promise<IMessage>;
}

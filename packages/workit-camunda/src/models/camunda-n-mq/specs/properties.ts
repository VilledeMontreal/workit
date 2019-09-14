/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ICustomHeaders } from './customHeaders';
import { IPropertiesBase } from './propertiesBase';

export interface IProperties<T = ICustomHeaders> extends Readonly<IPropertiesBase> {
  customHeaders: T;
}

/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface ICustomHeaders {
  [custom: string]: string | Date | number | boolean;
}

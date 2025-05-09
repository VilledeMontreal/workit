/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export const dateTimeReviver = (key: unknown, value: unknown) => {
  let a;
  if (typeof value === 'string' && value[0] === '2' && value[value.length - 1] === 'Z') {
    a = Date.parse(value);
    if (!isNaN(a)) {
      return new Date(a);
    }
  }
  return value;
};

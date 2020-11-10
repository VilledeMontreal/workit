/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export const concatPath = (path: string, property: string | number | symbol) => {
  let clonePath = path;
  if (property && property.toString) {
    if (path) {
      clonePath += '.';
    }

    clonePath += property.toString();
  }

  return clonePath;
};

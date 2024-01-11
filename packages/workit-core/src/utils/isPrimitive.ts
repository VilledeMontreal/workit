/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export const isPrimitive = (value: any) => value === null || (typeof value !== 'object' && typeof value !== 'function');

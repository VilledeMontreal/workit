/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
/**
 * Default symbol map.
 */
export const symbols = {
  ok: '✓',
  err: '✖',
  dot: '․',
};

// With node.js on Windows: use symbols available in terminal default fonts
if (process && process.platform === 'win32') {
  symbols.ok = '\u221A';
  symbols.err = '\u00D7';
  symbols.dot = '.';
}

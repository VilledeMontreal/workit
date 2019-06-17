/**
 * Default symbol map.
 */
export const symbols = {
  ok: '✓',
  err: '✖',
  dot: '․'
};

// With node.js on Windows: use symbols available in terminal default fonts
if (process && process.platform === 'win32') {
  symbols.ok = '\u221A';
  symbols.err = '\u00D7';
  symbols.dot = '.';
}

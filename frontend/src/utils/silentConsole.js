/**
 * Silence non-error console methods in production builds.
 * Import this module from the app entry point (src/index.js).
 * Keeps console.error intact so runtime errors still show.
 */
(function () {
  if (typeof window === 'undefined') return;
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return;
  const noop = () => {};
  try {
    if (console.debug) console.debug = noop;
    if (console.log) console.log = noop;
    if (console.info) console.info = noop;
    if (console.warn) console.warn = noop;
  } catch (e) {
    // ignore protective failure
  }
})();

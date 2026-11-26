// Spike R1: the store's nonce-based CSP (S9, S11). Throwaway, never merged.
export function contentSecurityPolicy(nonce: string, isDev: boolean) {
  return [
    "default-src 'self'",
    // 'strict-dynamic': scripts the nonced ones load are trusted too, and 'self' is ignored.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

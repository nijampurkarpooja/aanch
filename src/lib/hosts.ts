export type Area = "store" | "admin";

/**
 * Where a request is served from. Each host's routes live under its own internal prefix
 * (`src/app/store`, `src/app/admin`), and every path is prefixed, never filtered: a store-host
 * request for `/admin/x` becomes `/store/admin/x`, which doesn't exist. So neither host can reach
 * the other's routes, however the path is spelled or encoded (S27).
 */
export function routeRequest(
  host: string | null,
  pathname: string,
  adminHost: string,
): { area: Area; pathname: string } {
  // shortcut: any host other than the admin host is the store, so Vercel previews (random hosts)
  // show the store only; add a preview admin host if admin previews are needed.
  // A fully qualified name may end in a dot (`admin.example.com.`); it's the same host.
  const normalised = host?.toLowerCase().replace(/\.(?=:\d+$|$)/, "");
  const area: Area = normalised === adminHost ? "admin" : "store";
  return { area, pathname: pathname === "/" ? `/${area}` : `/${area}${pathname}` };
}

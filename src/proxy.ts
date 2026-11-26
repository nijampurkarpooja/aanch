import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { contentSecurityPolicy } from "@/lib/csp";
import { routeRequest } from "@/lib/hosts";

export function proxy(request: NextRequest) {
  const { area, pathname } = routeRequest(
    request.headers.get("host"),
    request.nextUrl.pathname,
    env().ADMIN_HOST,
  );
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  // Spike R1: a fresh nonce per request. Next reads it from the request's CSP header and puts it
  // on its own scripts and styles.
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  if (area === "admin") response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export const config = {
  // Everything except Next's own assets and dev endpoints, which are the same on both hosts.
  // `$` and the escaped dot make favicon.ico an exact name, not a prefix.
  // Spike R1: `r1/` is the spike's public image; public files 404 through the prefix rewrite.
  matcher: ["/((?!_next/|__nextjs_|favicon\\.ico$|r1/).*)"],
};

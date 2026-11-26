import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { routeRequest } from "@/lib/hosts";

export function proxy(request: NextRequest) {
  const { area, pathname } = routeRequest(
    request.headers.get("host"),
    request.nextUrl.pathname,
    env().ADMIN_HOST,
  );
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.rewrite(url);
  if (area === "admin") response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export const config = {
  // Everything except Next's own assets and dev endpoints, which are the same on both hosts.
  matcher: ["/((?!_next/|__nextjs|favicon.ico).*)"],
};

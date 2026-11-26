import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";
import { proxy } from "./proxy";

beforeAll(() => {
  process.env.STORE_HOST = "localhost:3000";
  process.env.ADMIN_HOST = "admin.localhost:3000";
});

function request(host: string, path: string) {
  return proxy(new NextRequest(`http://${host}${path}`, { headers: { host } }));
}

describe("proxy", () => {
  it("S27: rewrites admin-host requests into /admin, marked noindex", () => {
    const response = request("admin.localhost:3000", "/orders");
    expect(new URL(response.headers.get("x-middleware-rewrite")!).pathname).toBe("/admin/orders");
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
  });

  it("S27: rewrites store-host requests into /store, indexable", () => {
    const response = request("localhost:3000", "/admin/orders");
    expect(new URL(response.headers.get("x-middleware-rewrite")!).pathname).toBe(
      "/store/admin/orders",
    );
    expect(response.headers.get("x-robots-tag")).toBeNull();
  });

  it("keeps the query string", () => {
    const response = request("localhost:3000", "/shop?finish=neel");
    expect(new URL(response.headers.get("x-middleware-rewrite")!).search).toBe("?finish=neel");
  });
});

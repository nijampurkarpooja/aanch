import { describe, expect, it } from "vitest";
import { routeRequest } from "./hosts";

const ADMIN = "admin.localhost:3000";

describe("routeRequest", () => {
  it("serves the store host from /store", () => {
    expect(routeRequest("localhost:3000", "/", ADMIN)).toEqual({
      area: "store",
      pathname: "/store",
    });
    expect(routeRequest("localhost:3000", "/shop/katori", ADMIN).pathname).toBe(
      "/store/shop/katori",
    );
  });

  it("serves the admin host from /admin", () => {
    expect(routeRequest(ADMIN, "/", ADMIN)).toEqual({ area: "admin", pathname: "/admin" });
    expect(routeRequest(ADMIN, "/orders", ADMIN).pathname).toBe("/admin/orders");
  });

  it("matches the admin host case-insensitively", () => {
    expect(routeRequest("Admin.Localhost:3000", "/", ADMIN).area).toBe("admin");
  });

  it("S27: admin paths on the store host stay inside the store", () => {
    for (const path of ["/admin", "/admin/orders", "/%61dmin", "//admin"]) {
      expect(routeRequest("localhost:3000", path, ADMIN).pathname).toBe(`/store${path}`);
    }
  });

  it("S27: store paths on the admin host stay inside the admin", () => {
    expect(routeRequest(ADMIN, "/store/cart", ADMIN).pathname).toBe("/admin/store/cart");
  });

  it("treats a missing or unknown host as the store", () => {
    expect(routeRequest(null, "/", ADMIN).area).toBe("store");
    expect(routeRequest("evil.example", "/orders", ADMIN).area).toBe("store");
  });
});

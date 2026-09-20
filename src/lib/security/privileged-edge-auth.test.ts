import { describe, expect, it } from "vitest";

import { authorizeBearer } from "../../../supabase/functions/_shared/privileged-auth";

describe("privileged edge bearer auth", () => {
  it("fails closed when the server secret is not configured", () => {
    const response = authorizeBearer(new Request("https://example.test"), undefined);
    expect(response?.status).toBe(503);
  });

  it("rejects missing or ordinary bearer credentials", () => {
    const response = authorizeBearer(
      new Request("https://example.test", {
        headers: { authorization: "Bearer learner-jwt" },
      }),
      "server-only-secret",
    );
    expect(response?.status).toBe(401);
  });

  it("accepts only the exact server-only bearer secret", () => {
    const response = authorizeBearer(
      new Request("https://example.test", {
        headers: { authorization: "Bearer server-only-secret" },
      }),
      "server-only-secret",
    );
    expect(response).toBeNull();
  });
});

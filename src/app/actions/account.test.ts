import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAllMyData } from "./account";

/**
 * Contract tests for deleteAllMyData — the action is a thin auth-gated
 * pass-through to the delete_my_data() RPC; the erasure scope and atomicity
 * are proven by supabase/tests/database/delete_my_data.test.sql.
 */
const h = vi.hoisted(() => {
  const getUser = vi.fn();
  const rpc = vi.fn(
    async (): Promise<{
      data: unknown;
      error: { message: string } | null;
    }> => ({ data: null, error: null }),
  );
  return { getUser, rpc };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: h.getUser },
    rpc: h.rpc,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  h.getUser.mockResolvedValue({
    data: { user: { id: "66666666-6666-4666-8666-666666666666" } },
  });
  h.rpc.mockResolvedValue({ data: null, error: null });
});

describe("deleteAllMyData", () => {
  it("rejects guests before touching the RPC", async () => {
    h.getUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await deleteAllMyData();
    expect(res).toEqual({ ok: false, error: "unauthorized" });
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("invokes delete_my_data through the caller's JWT", async () => {
    const res = await deleteAllMyData();
    expect(res).toEqual({ ok: true });
    expect(h.rpc).toHaveBeenCalledWith("delete_my_data");
    // No target argument exists — the RPC erases auth.uid() only.
    expect(h.rpc.mock.calls[0]).toHaveLength(1);
  });

  it("surfaces an RPC failure instead of claiming success", async () => {
    h.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    const res = await deleteAllMyData();
    expect(res).toEqual({ ok: false, error: "delete_failed" });
  });
});

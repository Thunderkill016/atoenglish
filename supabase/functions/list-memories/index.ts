/**
 * list-memories — privileged Supabase Edge Function.
 * Requires: Authorization: Bearer $PROJECT_MEMORY_ADMIN_TOKEN
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { authorizeBearer, jsonResponse } from "../_shared/privileged-auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authError = authorizeBearer(
    req,
    Deno.env.get("PROJECT_MEMORY_ADMIN_TOKEN"),
  );
  if (authError) return authError;

  let body: {
    category?: string;
    project?: string;
    limit?: number;
    offset?: number;
  } = {};

  try {
    body = await req.json();
  } catch {
    // Empty body is valid.
  }

  const limit = Math.min(Math.max(body.limit ?? 20, 1), 100);
  const offset = Math.max(body.offset ?? 0, 0);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    let query = supabase
      .from("project_memories")
      .select("id, content, category, project, metadata, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (body.category) query = query.eq("category", body.category);
    if (body.project) query = query.eq("project", body.project);

    const { data, error, count } = await query;
    if (error) throw error;

    const byCategory: Record<string, number> = {};
    (data ?? []).forEach((memory) => {
      byCategory[memory.category] = (byCategory[memory.category] ?? 0) + 1;
    });

    return jsonResponse({
      memories: data ?? [],
      count: data?.length ?? 0,
      total: count ?? 0,
      by_category: byCategory,
      filter: {
        category: body.category ?? null,
        project: body.project ?? "atoenglish",
      },
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});

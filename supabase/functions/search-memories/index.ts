/**
 * search-memories — privileged Supabase Edge Function.
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
    query: string;
    threshold?: number;
    limit?: number;
    project?: string;
    category?: string;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.query?.trim()) {
    return jsonResponse({ error: "query is required" }, 400);
  }

  try {
    const model = new Supabase.ai.Session("gte-small");
    const embedding = await model.run(body.query.trim(), {
      mean_pool: true,
      normalize: true,
    }) as number[];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase.rpc("match_memories", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: body.threshold ?? 0.70,
      match_count: Math.min(Math.max(body.limit ?? 8, 1), 50),
      filter_project: body.project ?? null,
      filter_category: body.category ?? null,
    });

    if (error) throw error;

    return jsonResponse({
      memories: data ?? [],
      count: data?.length ?? 0,
      query: body.query,
    });
  } catch (err) {
    console.error("[search-memories]", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});

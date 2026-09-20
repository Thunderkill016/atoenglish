/**
 * store-memory — privileged Supabase Edge Function.
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
    content: string;
    category?: string;
    project?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.content?.trim()) {
    return jsonResponse({ error: "content is required" }, 400);
  }

  try {
    const model = new Supabase.ai.Session("gte-small");
    const embedding = await model.run(body.content.trim(), {
      mean_pool: true,
      normalize: true,
    }) as number[];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("project_memories")
      .insert({
        content: body.content.trim(),
        embedding: JSON.stringify(embedding),
        category: body.category ?? "context",
        project: body.project ?? "atoenglish",
        metadata: {
          ...body.metadata,
          stored_at: new Date().toISOString(),
        },
      })
      .select("id, content, category, created_at")
      .single();

    if (error) throw error;
    return jsonResponse({ success: true, memory: data });
  } catch (err) {
    console.error("[store-memory]", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});

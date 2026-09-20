/**
 * manage-memory — privileged Supabase Edge Function.
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
    action: "delete" | "update";
    id: number;
    content?: string;
    category?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.id || !body.action) {
    return jsonResponse({ error: "id and action are required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    if (body.action === "delete") {
      const { error } = await supabase
        .from("project_memories")
        .delete()
        .eq("id", body.id);
      if (error) throw error;
      return jsonResponse({ success: true, deleted_id: body.id });
    }

    if (body.action === "update") {
      if (!body.content?.trim()) {
        return jsonResponse({ error: "content is required for update" }, 400);
      }

      const model = new Supabase.ai.Session("gte-small");
      const embedding = await model.run(body.content.trim(), {
        mean_pool: true,
        normalize: true,
      }) as number[];

      const updates: Record<string, unknown> = {
        content: body.content.trim(),
        embedding: JSON.stringify(embedding),
      };
      if (body.category) updates.category = body.category;
      if (body.metadata) {
        updates.metadata = {
          ...body.metadata,
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from("project_memories")
        .update(updates)
        .eq("id", body.id)
        .select("id, content, category, created_at")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, memory: data });
    }

    return jsonResponse({ error: `Unknown action: ${body.action}` }, 400);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});

import { action } from "./_generated/server";
import { v } from "convex/values";

const S = v.union(
  v.literal("received"),
  v.literal("analyzing"),
  v.literal("analyzed"),
  v.literal("replied"),
  v.literal("closed"),
);
const U = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);
const C = v.union(
  v.literal("billing"),
  v.literal("technical"),
  v.literal("complaint"),
  v.literal("information"),
  v.literal("other"),
);
const N = v.union(
  v.literal("positive"),
  v.literal("neutral"),
  v.literal("negative"),
);

// Sync the ticket to N8n
export const syncTicketToN8n = action({
  args: {
    requestId: v.id("requests"),
    customer_email: v.string(),
    text: v.string(),
    status: S,
    urgency: U,
    category: C,
    sentiment: N,
    created_at: v.number(),
    processed_at: v.optional(v.number()),
    model_used: v.optional(v.string()),
    suggested_response: v.optional(v.string()),
    analysis_error: v.optional(v.string()),
  },
  handler: async (_, row) => {
    const url = process.env.N8N_WEBHOOK_URL?.trim();
    if (!url) return { ok: false as const };

    const h: Record<string, string> = { "Content-Type": "application/json" };
    const secret = process.env.N8N_WEBHOOK_SECRET?.trim();
    if (secret) h.Authorization = `Bearer ${secret}`;

    const body = JSON.stringify({
      id: row.requestId,
      customer_email: row.customer_email,
      text: row.text,
      status: row.status,
      urgency: row.urgency,
      category: row.category,
      sentiment: row.sentiment,
      created_at: row.created_at,
      processed_at: row.processed_at ?? null,
      model_used: row.model_used ?? null,
      suggested_response: row.suggested_response ?? null,
      analysis_error: row.analysis_error ?? null,
    });

    try {
      const res = await fetch(url, { method: "POST", headers: h, body });
      if (!res.ok) {
        console.error("syncTicketToN8n", res.status, await res.text());
        return { ok: false as const };
      }
      return { ok: true as const };
    } catch (e) {
      console.error("syncTicketToN8n", e);
      return { ok: false as const };
    }
  },
});

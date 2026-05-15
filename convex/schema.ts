// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  requests: defineTable({
    // Core fields
    text: v.string(),
    customer_email: v.string(),
    
    // Status tracking
    status: v.union(
      v.literal("received"),
      v.literal("analyzing"),
      v.literal("analyzed"),
      v.literal("replied"),
      v.literal("closed")
    ),
    
    // LLM analysis fields
    urgency: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    
    category: v.union(
      v.literal("billing"),
      v.literal("technical"),
      v.literal("complaint"),
      v.literal("information"),
      v.literal("other")
    ),
    
    sentiment: v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    ),
    
    // Response fields
    suggested_response: v.optional(v.string()),
    final_response: v.optional(v.string()),
    
    // Metadata
    model_used: v.optional(v.string()),
    created_at: v.number(),
    processed_at: v.optional(v.number()),
    responded_at: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["customer_email"])
    .index("by_created_at", ["created_at"])
    .index("by_urgency", ["urgency"]),
});
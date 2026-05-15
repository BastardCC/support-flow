// convex/requests.ts
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new customer request
export const createRequest = mutation({
  args: {
    text: v.string(),
    customer_email: v.string(),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("requests", {
      text: args.text,
      customer_email: args.customer_email,
      status: "received",
      urgency: "low",
      category: "other",
      sentiment: "neutral",
      created_at: Date.now(),
    });
    await ctx.scheduler.runAfter(0, api.llm.analyzeRequest, {
      requestId,
      text: args.text,
    });
    return requestId;
  },
});
// Get all requests (for dashboard)
export const getAllRequests = query({
  handler: async (ctx) => {
    return await ctx.db.query("requests").order("desc").collect();
  },
});

// Get a single request by ID
export const getRequest = query({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update request status
export const updateStatus = mutation({
  args: {
    id: v.id("requests"),
    status: v.union(
      v.literal("received"),
      v.literal("analyzing"),
      v.literal("analyzed"),
      v.literal("replied"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Update request with LLM analysis results
export const updateAnalysis = mutation({
  args: {
    id: v.id("requests"),
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
    suggested_response: v.string(),
    model_used: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      urgency: args.urgency,
      category: args.category,
      sentiment: args.sentiment,
      suggested_response: args.suggested_response,
      model_used: args.model_used,
      status: "analyzed",
      processed_at: Date.now(),
      analysis_error: undefined,
    });
  },
});

/** Après échec LLM : reste en valeurs par défaut + message pour le tableau de bord */
export const failAnalysis = mutation({
  args: {
    id: v.id("requests"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const truncated =
      args.message.length > 2000
        ? `${args.message.slice(0, 2000)}…`
        : args.message;
    await ctx.db.patch(args.id, {
      status: "received",
      analysis_error: truncated,
    });
  },
});

// Delete a request (optional, for cleanup)
export const deleteRequest = mutation({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
"use node";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

const analysisSchema = z.object({
  urgency: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["billing", "technical", "complaint", "information", "other"]),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  suggested_response: z.string(),
});

export const analyzeRequest = action({
  args: { requestId: v.id("requests"), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.requests.updateStatus, {
      id: args.requestId,
      status: "analyzing",
    });
    try {
      const apiKey = process.env.OPENROUTER_API_KEY?.trim();
      if (!apiKey) throw new Error("OPENROUTER_API_KEY absent (Convex env)");
      const modelId = process.env.OPENROUTER_MODEL ?? "openrouter/free";
      const model = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      }).chat(modelId);

      const { text } = await generateText({
        model,
        messages: [
          {
            role: "user",
            content: `Réponds uniquement avec un JSON valide (pas de markdown). 
            Clés: 
            urgency (low|medium|high|critical), 
            category (billing|technical|complaint|information|other), 
            sentiment (positive|neutral|negative), 
            suggested_response (réponse pro en français).
            Réponds uniquement avec un JSON valide (pas de markdown). 

            Demande: ${JSON.stringify(args.text)}`,
          },
        ],
        temperature: 0.3,
      });

      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Réponse sans JSON");
      const analysis = analysisSchema.parse(JSON.parse(m[0]));

      await ctx.runMutation(api.requests.updateAnalysis, {
        id: args.requestId,
        ...analysis,
        model_used: modelId,
      });

      const doc = await ctx.runQuery(api.requests.getRequest, {
        id: args.requestId,
      });
      if (doc) {
        await ctx.scheduler.runAfter(0, api.integrations.syncTicketToN8n, {
          requestId: doc._id,
          customer_email: doc.customer_email,
          text: doc.text,
          status: doc.status,
          urgency: doc.urgency,
          category: doc.category,
          sentiment: doc.sentiment,
          created_at: doc.created_at,
          processed_at: doc.processed_at,
          model_used: doc.model_used,
          suggested_response: doc.suggested_response,
          analysis_error: doc.analysis_error,
        });
      }
    } catch (e) {
      await ctx.runMutation(api.requests.failAnalysis, {
        id: args.requestId,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  },
});

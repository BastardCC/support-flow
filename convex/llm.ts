"use node";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

const analysisSchema = z.object({
  urgency: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum([
    "billing",
    "technical",
    "complaint",
    "information",
    "other",
  ]),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  suggested_response: z.string(),
});

function openRouterModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "OPENROUTER_API_KEY est absent : ajoutez-le dans le tableau Convex (Variables d’environnement), pas seulement dans .env.local.",
    );
  }
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
  const modelId = process.env.OPENROUTER_MODEL ?? "openrouter/free";
  return { model: openrouter.chat(modelId), modelId };
}

export const analyzeRequest = action({
  args: {
    requestId: v.id("requests"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.requests.updateStatus, {
      id: args.requestId,
      status: "analyzing",
    });

    try {
      const prompt = `Analyse cette demande client et réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans texte avant ou après), au format exact suivant :
{
  "urgency": "low|medium|high|critical",
  "category": "billing|technical|complaint|information|other",
  "sentiment": "positive|neutral|negative",
  "suggested_response": "une réponse professionnelle en français, adaptée au ton du message"
}

Demande client (texte brut, une seule chaîne) :
${JSON.stringify(args.text)}`;

      const { model, modelId } = openRouterModel();
      const { text } = await generateText({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Réponse LLM sans bloc JSON");

      const parsed = JSON.parse(jsonMatch[0]) as unknown;
      const analysis = analysisSchema.parse(parsed);

      await ctx.runMutation(api.requests.updateAnalysis, {
        id: args.requestId,
        urgency: analysis.urgency,
        category: analysis.category,
        sentiment: analysis.sentiment,
        suggested_response: analysis.suggested_response,
        model_used: modelId,
      });

      return { ok: true as const, analysis };
    } catch (error) {
      console.error("LLM analysis failed:", error);
      const message =
        error instanceof Error ? error.message : String(error);
      await ctx.runMutation(api.requests.failAnalysis, {
        id: args.requestId,
        message,
      });
      return { ok: false as const, error: message };
    }
  },
});

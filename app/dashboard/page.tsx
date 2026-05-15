"use client";

import { StatusBadge } from "@/components/SupportStatusBadge";
import { api } from "@/convex/_generated/api";
import { formatRelative } from "@/utils/format-relative";
import {
  categoryLabels,
  sentimentLabels,
  urgencyLabels,
} from "@/utils/support-labels";
import { useQuery } from "convex/react";

export default function DashboardPage() {
  const requests = useQuery(api.requests.getAllRequests);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
            SupportFlow
          </p>
          <h1 className="mt-1 font-semibold text-3xl tracking-tight text-zinc-900 dark:text-zinc-50">
            Tableau des demandes
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Vue d’ensemble des tickets : statut, analyse LLM et proposition de réponse.
          </p>
        </header>

        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Demandes
            </h2>
            {requests !== undefined && (
              <span className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                {requests.length} ticket{requests.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {requests === undefined && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-14 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
              Chargement des demandes…
            </div>
          )}

          {requests?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                Aucune demande pour le moment
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Créez un ticket depuis la page Support.
              </p>
            </div>
          )}

          <ul className="space-y-4">
            {requests?.map((request) => (
              <li
                key={request._id}
                className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {request.customer_email}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatRelative(request.created_at)}
                      {request.model_used ? (
                        <span className="before:mx-1.5 before:text-zinc-300 before:content-['·'] dark:before:text-zinc-600">
                          Modèle : {request.model_used}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {request.text}
                </p>

                {request.analysis_error ? (
                  <div className="mt-4 rounded-xl border border-red-300/80 bg-red-500/10 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/40">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                      Analyse non terminée
                    </p>
                    <p className="mt-2 font-mono text-xs leading-relaxed text-red-900/90 dark:text-red-200/90">
                      {request.analysis_error}
                    </p>
                    <p className="mt-2 text-xs text-red-800/80 dark:text-red-300/80">
                      Les champs urgence / catégorie / sentiment affichés sont encore les{" "}
                      <strong>valeurs par défaut</strong> à la création du ticket. Vérifiez les{" "}
                      <strong>logs Convex</strong> et la variable{" "}
                      <code className="rounded bg-red-500/15 px-1 py-0.5">
                        OPENROUTER_API_KEY
                      </code>{" "}
                      dans le tableau Convex (pas seulement dans{" "}
                      <code className="rounded bg-red-500/15 px-1 py-0.5">
                        .env.local
                      </code>
                      ).
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Urgence :{" "}
                    {urgencyLabels[
                      request.urgency as keyof typeof urgencyLabels
                    ] ?? request.urgency}
                  </span>
                  <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Catégorie :{" "}
                    {categoryLabels[
                      request.category as keyof typeof categoryLabels
                    ] ?? request.category}
                  </span>
                  <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Sentiment :{" "}
                    {sentimentLabels[
                      request.sentiment as keyof typeof sentimentLabels
                    ] ?? request.sentiment}
                  </span>
                </div>

                {request.suggested_response ? (
                  <div className="mt-5 rounded-xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 dark:border-sky-900/60 dark:bg-sky-950/40">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
                      Proposition de réponse (LLM)
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {request.suggested_response}
                    </p>
                  </div>
                ) : request.status === "analyzing" ? (
                  <p className="mt-4 text-sm italic text-zinc-500 dark:text-zinc-400">
                    Analyse en cours — les métadonnées et la réponse suggérée apparaîtront ici.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

"use client";

import { StatusBadge } from "@/components/SupportStatusBadge";
import {
  categoryLabels,
  sentimentLabels,
  urgencyLabels,
} from "@/utils/support-labels";
import { formatRelative } from "@/utils/format-relative";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createRequest = useMutation(api.requests.createRequest);
  const requests = useQuery(api.requests.getAllRequests);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRequest({ text, customer_email: email });
      setText("");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
            SupportFlow
          </p>
          <h1 className="mt-1 font-semibold text-3xl tracking-tight text-zinc-900 dark:text-zinc-50">
            Créer un ticket
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Les tickets sont analysés automatiquement après envoi (urgence, catégorie,
            sentiment et proposition de réponse).
          </p>
        </header>

        <section className="mb-12 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Nouvelle demande
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Renseignez l’e-mail du client et le message ; l’analyse LLM démarre tout seul.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                E-mail du client
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="client@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-sky-500/0 transition placeholder:text-zinc-400 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Message
              </label>
              <textarea
                id="message"
                placeholder="Décrivez la demande ou collez le message du client…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                required
                className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none ring-sky-500/0 transition placeholder:text-zinc-400 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:pointer-events-none disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                {submitting ? "Envoi en cours…" : "Créer le ticket"}
              </button>
              {submitting && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Enregistrement et lancement de l’analyse…
                </span>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";

function textFromMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        p.type === "text" && typeof (p as { text?: string }).text === "string",
    )
    .map((p) => p.text)
    .join("");
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, status } = useChat();
  const listRef = useRef<HTMLDivElement>(null);

  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, status]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="support-chat-panel"
        className="cursor-pointer fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg ring-2 ring-white/30 transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 dark:ring-zinc-950/50"
      >
        <span className="sr-only">
          {open ? "Fermer l’assistant" : "Parler à l’assistant"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open ? (
        <div
          id="support-chat-panel"
          role="dialog"
          aria-label="Assistant SupportFlow"
          className="support-chat-panel-animate fixed bottom-[5.25rem] right-5 z-50 flex max-h-[min(70vh,28rem)] w-[min(calc(100vw-2.5rem),22rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Assistant
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Posez vos questions sur un problème
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Fermer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Décrivez votre problème ou celui d’un client : connexion,
                facturation, bug…
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-sky-600 text-white dark:bg-sky-500"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {textFromMessage(m)}
                  </div>
                </div>
              ))
            )}
            {busy ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Réponse en cours…
              </p>
            ) : null}
          </div>

          <form
            className="border-t border-zinc-200 p-3 dark:border-zinc-800"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const text = String(fd.get("msg") ?? "").trim();
              if (!text || busy) return;
              void sendMessage({ text });
              e.currentTarget.reset();
            }}
          >
            <div className="flex flex-col gap-2">
              <textarea
                name="msg"
                placeholder="Votre message…"
                rows={3}
                autoComplete="off"
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.shiftKey) return;
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }}
                className="min-h-[5rem] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-snug text-zinc-900 outline-none ring-sky-500/0 transition placeholder:text-zinc-400 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/15 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={busy}
                className="self-end rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:pointer-events-none disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

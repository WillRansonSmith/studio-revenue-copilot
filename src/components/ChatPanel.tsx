"use client";

import { useState, useRef, useEffect } from "react";
import type { CopilotStructuredResponse } from "@/app/api/chat/route";
import { Send, MessageSquare } from "lucide-react";

const STARTER_QUESTIONS = [
  "Which time slots have the lowest fill rate?",
  "Should we change pricing for lunch or afternoon classes?",
  "How is our star instructor's revenue vs others?",
  "What promotions would improve weekend attendance?",
  "Summarize revenue and fill trends for the last month.",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  structured?: CopilotStructuredResponse;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    setMessages((m) => m.concat({ role: "user", content: trimmed }));
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) =>
          m.concat({
            role: "assistant",
            content: `Error: ${data.error ?? res.statusText}`,
          })
        );
        return;
      }
      setMessages((m) =>
        m.concat({
          role: "assistant",
          content: data.summary ?? JSON.stringify(data),
          structured: data as CopilotStructuredResponse,
        })
      );
    } catch (e) {
      setMessages((m) =>
        m.concat({
          role: "assistant",
          content: `Request failed: ${e instanceof Error ? e.message : "Unknown error"}`,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <MessageSquare className="h-5 w-5 text-zinc-500" />
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Revenue Copilot</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ask about pricing, fill rates, schedules, or promotions. Try a starter question:
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              }`}
            >
              {msg.content}
            </div>
            {msg.structured && (
              <StructuredBlock data={msg.structured} />
            )}
          </div>
        ))}
        {loading && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-zinc-200 p-3 dark:border-zinc-700"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, fill rate, pricing…"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function StructuredBlock({ data }: { data: CopilotStructuredResponse }) {
  return (
    <div className="mt-3 max-w-full rounded-lg border border-zinc-200 bg-white p-3 text-left text-sm dark:border-zinc-700 dark:bg-zinc-800">
      {data.recommendedAction && (
        <p>
          <strong>Recommended action:</strong> {data.recommendedAction}
        </p>
      )}
      {data.expectedImpact && (
        <p>
          <strong>Expected impact:</strong> {data.expectedImpact}
        </p>
      )}
      {data.confidence && (
        <p>
          <strong>Confidence:</strong> {data.confidence}
          {data.confidenceReason && ` — ${data.confidenceReason}`}
        </p>
      )}
      {data.risksAndFairness && (
        <p>
          <strong>Risks & fairness:</strong> {data.risksAndFairness}
        </p>
      )}
      {data.memberFacingMessage && (
        <p className="mt-2 rounded border-l-2 border-emerald-500 pl-2 text-zinc-600 dark:text-zinc-400">
          <strong>Member message:</strong> {data.memberFacingMessage}
        </p>
      )}
    </div>
  );
}

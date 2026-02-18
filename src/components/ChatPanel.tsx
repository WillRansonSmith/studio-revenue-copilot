"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CopilotStructuredResponse } from "@/app/api/chat/route";
import { Send, Sparkles } from "lucide-react";

const STARTER_QUESTIONS = [
  "Which time slots have the lowest fill rate?",
  "Should we change pricing for lunch or afternoon classes?",
  "How is our star instructor's revenue vs others?",
  "What promotions would improve weekend attendance?",
  "Summarize revenue and fill trends for the last month.",
];

const NEAR_BOTTOM_THRESHOLD = 120;

interface Message {
  role: "user" | "assistant";
  content: string;
  structured?: CopilotStructuredResponse;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wasNearBottomRef = useRef(true);

  const checkNearBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el || !wasNearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    wasNearBottomRef.current = checkNearBottom();
    setMessages((m) => m.concat({ role: "user", content: trimmed }));
    setInput("");
    wasNearBottomRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      wasNearBottomRef.current = checkNearBottom();
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
      wasNearBottomRef.current = checkNearBottom();
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
    <div className="flex h-full flex-col rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-700/80">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Revenue Copilot</h3>
          <p className="text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">AI-powered insights</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollAreaRef} className="chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Ask about pricing, fill rates, schedules, or promotions. Try a starter question below.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-left text-xs font-medium text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/60"
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
            className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[88%] ${msg.role === "assistant" ? "space-y-2" : ""}`}>
              {msg.role === "assistant" && (
                <div className="mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Copilot</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md bg-emerald-600 text-white"
                    : "rounded-bl-md border border-zinc-200/80 bg-zinc-50 text-zinc-700 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-200"
                }`}
              >
                {msg.content}
              </div>
              {msg.structured && (
                <StructuredBlock data={msg.structured} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-[88%]">
              <div className="mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Copilot</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-zinc-200/80 bg-zinc-50 px-4 py-3 dark:border-zinc-700/80 dark:bg-zinc-800">
                <span className="loading-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="loading-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="loading-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="shrink-0 border-t border-zinc-200/80 p-3 dark:border-zinc-700/80"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "Waiting for response…" : "Ask about revenue, fill rate, pricing…"}
            className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function StructuredBlock({ data }: { data: CopilotStructuredResponse }) {
  const items = [
    { label: "Action", value: data.recommendedAction },
    { label: "Impact", value: data.expectedImpact },
    {
      label: "Confidence",
      value: data.confidence
        ? `${data.confidence}${data.confidenceReason ? ` — ${data.confidenceReason}` : ""}`
        : undefined,
    },
    { label: "Risks", value: data.risksAndFairness },
  ].filter((item) => item.value);

  return (
    <div className="space-y-1.5 rounded-xl border border-zinc-200/80 bg-white p-3 text-sm dark:border-zinc-700/80 dark:bg-zinc-800/50">
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" style={{ minWidth: "5rem", paddingTop: "2px" }}>
            {item.label}
          </span>
          <span className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{item.value}</span>
        </div>
      ))}
      {data.memberFacingMessage && (
        <div className="mt-2 rounded-lg border-l-2 border-emerald-500 bg-emerald-50/50 py-1.5 pl-3 pr-2 dark:bg-emerald-950/20">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Member message
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {data.memberFacingMessage}
          </p>
        </div>
      )}
    </div>
  );
}

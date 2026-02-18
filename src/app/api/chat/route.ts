import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSessions } from "@/lib/data";
import { buildCorpus, retrieve } from "@/lib/retrieval";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/* ── Demo-mode configuration ────────────────────────────────────── */
const DEMO_MODE = process.env.DEMO_MODE === "1";
const DEMO_MAX_REQ_PER_MINUTE = Number(process.env.DEMO_MAX_REQ_PER_MINUTE) || 6;
const DEMO_MAX_REQ_PER_HOUR = Number(process.env.DEMO_MAX_REQ_PER_HOUR) || 30;
const DEMO_MAX_TOKENS = Number(process.env.DEMO_MAX_TOKENS) || 500;

export interface CopilotStructuredResponse {
  summary: string;
  recommendedAction: string;
  expectedImpact: string;
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  risksAndFairness: string;
  memberFacingMessage: string;
}

const STRUCTURE_PROMPT = `You are a studio revenue advisor. Answer using ONLY this structure (use the exact headings and plain text, no markdown):

Summary:
[1-2 sentences]

Recommended action:
[Price change and/or schedule and/or promotion]

Expected impact:
[Fill rate and revenue directional estimate]

Confidence:
[High/Medium/Low and why]

Risks & fairness notes:
[Member perception + instructor morale]

Suggested member-facing message:
[2-3 sentences]`;

function mockResponse(query: string, contextDocs: string[]): CopilotStructuredResponse {
  const hasPrice = /price|pricing|discount|cost/i.test(query);
  const hasSchedule = /schedule|slot|time|morning|evening|weekend/i.test(query);
  const hasFill = /fill|occupancy|demand|booked/i.test(query);
  const docSummary = contextDocs.slice(0, 3).join(" | ").slice(0, 200);

  return {
    summary: `Based on ${contextDocs.length} relevant sessions: ${docSummary}…`,
    recommendedAction: [
      hasPrice && "Consider a 10–15% trial discount on lunch/afternoon slots.",
      hasSchedule && "Shift 1–2 peak instructors to after-work slots.",
      !hasPrice && !hasSchedule && "Review pricing for low-fill slots and add a short promotion.",
    ]
      .filter(Boolean)
      .join(" ") || "Review low-fill slots and consider a limited-time promotion.",
    expectedImpact: "Fill rate +5–10% on targeted slots; revenue +3–7% over 4 weeks.",
    confidence: contextDocs.length >= 4 ? "Medium" : "Low",
    confidenceReason: contextDocs.length >= 4 ? "Enough session history to spot patterns." : "Limited matching data; recommend more history before big changes.",
    risksAndFairness: "Members may notice price differences by slot; communicate as 'peak vs off-peak' to avoid perception of unfairness. Rotate star instructor slots to support morale.",
    memberFacingMessage:
      "We’re piloting off-peak pricing so you can try more classes at a lower price. Your favorite classes and instructors are unchanged; we’ve added more value at quieter times.",
  };
}

export async function POST(req: NextRequest) {
  try {
    /* ── Demo-mode rate limiting ─────────────────────────────── */
    if (DEMO_MODE) {
      const ip = getClientIp(req);
      const result = checkRateLimit(ip, DEMO_MAX_REQ_PER_MINUTE, DEMO_MAX_REQ_PER_HOUR);
      if (!result.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "Demo is rate-limited. Try again in a moment.",
          },
          { status: 429 },
        );
      }
    }

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const sessions = getSessions();
    const corpus = buildCorpus(sessions);
    const topDocs = retrieve(message, corpus);
    const contextDocs = topDocs.map((d) => d.text);
    const contextBlock = contextDocs.length
      ? "Relevant session data (use for evidence):\n" + contextDocs.join("\n\n")
      : "No matching session data.";

    const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

    if (hasKey) {
      const maxTokens = DEMO_MODE ? DEMO_MAX_TOKENS : 1024;
      const anthropic = new Anthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: STRUCTURE_PROMPT + "\n\n" + contextBlock,
        messages: [{ role: "user", content: message }],
      });
      const text =
        response.content?.find((c) => c.type === "text")?.type === "text"
          ? (response.content?.find((c) => c.type === "text") as { type: "text"; text: string }).text
          : "";
      // Parse structured blocks from model output into our shape
      const parsed = parseStructuredOutput(text);
      return NextResponse.json(parsed);
    }

    const mock = mockResponse(message, contextDocs);
    return NextResponse.json(mock);
  } catch (e) {
    console.error("chat error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 500 }
    );
  }
}

function parseStructuredOutput(text: string): CopilotStructuredResponse {
  const sections: Record<string, string> = {};
  const headers = [
    "Summary",
    "Recommended action",
    "Expected impact",
    "Confidence",
    "Risks & fairness notes",
    "Suggested member-facing message",
  ];
  const keyMap: Record<string, string> = {
    summary: "summary",
    recommendedaction: "recommendedAction",
    expectedimpact: "expectedImpact",
    confidence: "confidenceReason",
    risksfairnessnotes: "risksAndFairness",
    suggestedmemberfacingmessage: "memberFacingMessage",
  };
  let rest = text;
  for (const h of headers) {
    const key = h.toLowerCase().replace(/\s+|\&/g, "");
    const mapKey = key in keyMap ? keyMap[key as keyof typeof keyMap] : key;
    const re = new RegExp(`${h}\\s*:?\\s*([\\s\\S]*?)(?=${headers.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}|$)`, "i");
    const m = rest.match(re);
    if (m) sections[mapKey] = m[1].trim();
  }
  const confMatch = text.match(/Confidence:\s*(High|Medium|Low)/i);
  const confidence = (confMatch ? confMatch[1] : "Medium") as "High" | "Medium" | "Low";
  return {
    summary: sections.summary || text.slice(0, 300),
    recommendedAction: sections.recommendedAction ?? "",
    expectedImpact: sections.expectedImpact ?? "",
    confidence,
    confidenceReason: sections.confidenceReason ?? confMatch?.[0] ?? "",
    risksAndFairness: sections.risksAndFairness ?? "",
    memberFacingMessage: sections.memberFacingMessage ?? "",
  };
}

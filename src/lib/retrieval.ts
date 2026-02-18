/**
 * Lightweight RAG-like retrieval: session → document string, token overlap + cosine over term frequency, topK.
 */

import type { ClassSession } from "./data";

export interface Doc {
  id: string;
  text: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function termFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  const allKeys = new Set([...a.keys(), ...b.keys()]);
  for (const k of allKeys) {
    const va = a.get(k) ?? 0;
    const vb = b.get(k) ?? 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function overlapScore(queryTokens: string[], docTokens: string[]): number {
  const qSet = new Set(queryTokens);
  let hits = 0;
  for (const t of docTokens) if (qSet.has(t)) hits++;
  return queryTokens.length ? hits / queryTokens.length : 0;
}

/** Turn a class session into a short document string for retrieval. */
export function sessionToDocument(s: ClassSession): Doc {
  const parts = [
    s.date,
    s.instructorName,
    s.classType,
    s.timeSlot,
    `price ${s.actualPrice} capacity ${s.capacity} booked ${s.booked} attended ${s.attended}`,
    `revenue ${s.revenue} cancellations ${s.cancellations} lead time ${s.bookingLeadTimeDays} days`,
  ];
  return { id: s.id, text: parts.join(" ") };
}

/** Build document list from sessions. */
export function buildCorpus(sessions: ClassSession[]): Doc[] {
  return sessions.map(sessionToDocument);
}

const TOP_K = 6;

/**
 * Simple similarity: token overlap + cosine over term frequency.
 * Returns top 6 docs by combined score.
 */
export function retrieve(query: string, corpus: Doc[]): Doc[] {
  const queryTokens = tokenize(query);
  const queryTf = termFreq(queryTokens);
  if (queryTokens.length === 0) return corpus.slice(0, TOP_K);

  const scored = corpus.map((doc) => {
    const docTokens = tokenize(doc.text);
    const docTf = termFreq(docTokens);
    const overlap = overlapScore(queryTokens, docTokens);
    const cos = cosine(queryTf, docTf);
    const score = 0.5 * overlap + 0.5 * cos;
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_K).map((x) => x.doc);
}

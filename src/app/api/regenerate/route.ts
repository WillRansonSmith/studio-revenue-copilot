import { NextResponse } from "next/server";
import { regenerate, getChangelog } from "@/lib/data";

export async function POST() {
  const sessions = regenerate();
  const changelog = getChangelog();
  return NextResponse.json({ sessions, changelog });
}

import { NextResponse } from "next/server";
import { getSessions, getChangelog } from "@/lib/data";

export async function GET() {
  const sessions = getSessions();
  const changelog = getChangelog();
  return NextResponse.json({ sessions, changelog });
}

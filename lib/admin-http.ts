import { NextRequest, NextResponse } from "next/server";

export function redirectTo(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

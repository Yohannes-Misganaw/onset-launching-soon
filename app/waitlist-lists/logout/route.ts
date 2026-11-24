import { NextRequest, NextResponse } from "next/server";
import { WAITLIST_ADMIN_COOKIE } from "@/lib/waitlist-admin-auth";
import { isSameOriginRequest, redirectTo } from "@/lib/admin-http";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const response = redirectTo("/waitlist-lists");
  response.cookies.set(WAITLIST_ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/waitlist-lists",
  });
  return response;
}

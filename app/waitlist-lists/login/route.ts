import { NextRequest, NextResponse } from "next/server";
import { getRequestIp, limiter } from "@/lib/rate-limit";
import {
  createWaitlistAdminSession,
  isValidWaitlistAdminPassword,
  isWaitlistAdminConfigured,
  WAITLIST_ADMIN_COOKIE,
  WAITLIST_ADMIN_SESSION_MAX_AGE,
} from "@/lib/waitlist-admin-auth";
import { isSameOriginRequest, redirectTo } from "@/lib/admin-http";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!isWaitlistAdminConfigured()) {
    return redirectTo("/waitlist-lists?error=config");
  }

  if (!limiter.check(5, `waitlist-admin:${getRequestIp(request.headers)}`)) {
    return redirectTo("/waitlist-lists?error=rate");
  }

  const formData = await request.formData().catch(() => null);
  const password = formData?.get("password");

  if (typeof password !== "string" || !isValidWaitlistAdminPassword(password)) {
    return redirectTo("/waitlist-lists?error=password");
  }

  const response = redirectTo("/waitlist-lists");
  response.cookies.set(WAITLIST_ADMIN_COOKIE, createWaitlistAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: WAITLIST_ADMIN_SESSION_MAX_AGE,
    path: "/waitlist-lists",
  });
  return response;
}

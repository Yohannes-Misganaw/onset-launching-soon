import { NextRequest, NextResponse } from "next/server";
import { db, isDuplicateEntryError } from "@/lib/db";
import { waitlist } from "@/lib/schema";
import { getRequestIp, limiter } from "@/lib/rate-limit";
import { isLanguageCode } from "@/lib/languages";
import { isCountryCode, toE164Phone } from "@/lib/countries";
import { sendWaitlistConfirmation } from "@/lib/waitlist-email";
import { AUDIENCE_ROLES, INTERESTS, parseChoices, parseOtherText } from "@/lib/survey";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;

export async function POST(request: NextRequest) {
  if (!limiter.check(5, `submit:${getRequestIp(request.headers)}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fields = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof fields.name === "string" ? fields.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  const rawLanguage = "language" in fields ? fields.language : "en";
  const rawPhone = typeof fields.phone === "string" ? fields.phone.trim() : "";
  const rawCountry = fields.country;

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: "Please enter your name.", field: "name" },
      { status: 400 }
    );
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address.", field: "email" },
      { status: 400 }
    );
  }

  if (!isLanguageCode(rawLanguage)) {
    return NextResponse.json(
      { error: "Please select a supported language." },
      { status: 400 }
    );
  }

  if (!rawPhone || !isCountryCode(rawCountry)) {
    return NextResponse.json(
      { error: "Phone number and country are required.", field: "phone" },
      { status: 400 }
    );
  }

  const phone = toE164Phone(rawPhone, rawCountry);
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter a valid phone number.", field: "phone" },
      { status: 400 }
    );
  }

  const interests = parseChoices(fields.interests, INTERESTS);
  if (!interests) {
    return NextResponse.json(
      { error: "Please select at least one thing you're interested in.", field: "interests" },
      { status: 400 }
    );
  }

  const interestsOther = parseOtherText(interests, fields.interestsOther);
  if (interestsOther === null) {
    return NextResponse.json(
      { error: "Please tell us what else you're interested in.", field: "interestsOther" },
      { status: 400 }
    );
  }

  const roles = parseChoices(fields.roles, AUDIENCE_ROLES);
  if (!roles) {
    return NextResponse.json(
      { error: "Please select at least one option that describes you.", field: "roles" },
      { status: 400 }
    );
  }

  const rolesOther = parseOtherText(roles, fields.rolesOther);
  if (rolesOther === null) {
    return NextResponse.json(
      { error: "Please tell us how you'd describe yourself.", field: "rolesOther" },
      { status: 400 }
    );
  }

  try {
    await db.insert(waitlist).values({
      name,
      email,
      phone,
      country: rawCountry,
      language: rawLanguage,
      interests: interests.join(","),
      interestsOther,
      roles: roles.join(","),
      rolesOther,
    });
    sendWaitlistConfirmation({ name, email, language: rawLanguage }).catch((error) => {
      console.error("Failed to send waitlist confirmation email", error);
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "You're already on the list. We'll be in touch." },
        { status: 409 }
      );
    }

    console.error("Failed to save waitlist entry", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

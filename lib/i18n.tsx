"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getLanguage, isLanguageCode, type LanguageCode } from "@/lib/languages";

export { LANGUAGES, type LanguageCode } from "@/lib/languages";

export interface Translation {
  kicker: string;
  headlineStart: string;
  headlineMiddle: string;
  headlineAccent: string;
  intro: string;
  comingSoon: string;
  joinCta: string;
  formTitle: string;
  formSubtitle: string;
  fullName: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  country: string;
  searchCountry: string;
  noCountries: string;
  submitting: string;
  successTitle: string;
  alreadyTitle: string;
  successBefore: string;
  successAfter: string;
  language: string;
  openMenu: string;
  closeMenu: string;
  errNameRequired: string;
  errEmailRequired: string;
  errEmailInvalid: string;
  errPhoneRequired: string;
  errPhoneInvalid: string;
  errRateLimit: string;
  errGeneric: string;
  errNetwork: string;
}

const TRANSLATIONS: Record<LanguageCode, Translation> = {
  en: {
    kicker: "The Ethiopian Film Production Marketplace",
    headlineStart: "Rent. Buy.",
    headlineMiddle: "Sell. Hire.",
    headlineAccent: "Find.",
    intro: "Find equipment, hire verified crew, discover filming locations, and buy or sell gear through one trusted platform.",
    comingSoon: "Coming soon",
    joinCta: "Join the waitlist",
    formTitle: "Join the waitlist",
    formSubtitle: "Be the first to know when Onset opens.",
    fullName: "Full name",
    namePlaceholder: "Your name",
    email: "Email address",
    emailPlaceholder: "you@example.com",
    phone: "Phone number",
    phonePlaceholder: "91 234 5678",
    country: "Country",
    searchCountry: "Search country or code",
    noCountries: "No countries found",
    submitting: "Joining...",
    successTitle: "You're on the list.",
    alreadyTitle: "You're already on the list.",
    successBefore: "We'll let you know the moment ",
    successAfter: " opens.",
    language: "Language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    errNameRequired: "Please enter your name",
    errEmailRequired: "Email is required",
    errEmailInvalid: "Please enter a valid email address",
    errPhoneRequired: "Phone number is required",
    errPhoneInvalid: "Please enter a valid phone number for the selected country",
    errRateLimit: "Too many attempts. Please try again in a minute.",
    errGeneric: "Something went wrong. Please try again.",
    errNetwork: "Network error. Check your connection and try again.",
  },
  am: {
    kicker: "የኢትዮጵያ የፊልም ፕሮዳክሽን የገበያ ቦታ",
    headlineStart: "ይከራዩ። ይግዙ።",
    headlineMiddle: "ይሽጡ። ይቅጠሩ።",
    headlineAccent: "ያግኙ።",
    intro: "መሣሪያዎችን ያግኙ፣ የተረጋገጡ ባለሙያዎችን ይቅጠሩ፣ የቀረጻ ቦታዎችን ያስሱ፣ እንዲሁም መሣሪያዎችን በአንድ የታመነ መድረክ ይግዙ ወይም ይሽጡ።",
    comingSoon: "በቅርቡ ይጀምራል",
    joinCta: "ዝርዝሩን ይቀላቀሉ",
    formTitle: "ዝርዝሩን ይቀላቀሉ",
    formSubtitle: "Onset ሲከፈት በመጀመሪያ ይወቁ።",
    fullName: "ሙሉ ስም",
    namePlaceholder: "አበበ ከበደ",
    email: "ኢሜይል",
    emailPlaceholder: "you@example.com",
    phone: "ስልክ ቁጥር",
    phonePlaceholder: "91 234 5678",
    country: "አገር",
    searchCountry: "አገር ወይም ኮድ ይፈልጉ",
    noCountries: "ምንም አገር አልተገኘም",
    submitting: "በመላክ ላይ...",
    successTitle: "ተመዝግበዋል",
    alreadyTitle: "ቀድመው ተመዝግበዋል",
    successBefore: "",
    successAfter: " እንደተከፈተ ወዲያውኑ እናሳውቅዎታለን።",
    language: "ቋንቋ",
    openMenu: "ምናሌ ክፈት",
    closeMenu: "ምናሌ ዝጋ",
    errNameRequired: "እባክዎ ስምዎን ያስገቡ",
    errEmailRequired: "ኢሜይል ያስፈልጋል",
    errEmailInvalid: "እባክዎ ትክክለኛ ኢሜይል ያስገቡ",
    errPhoneRequired: "ስልክ ቁጥር ያስፈልጋል",
    errPhoneInvalid: "እባክዎ ለተመረጠው አገር ትክክለኛ ስልክ ቁጥር ያስገቡ",
    errRateLimit: "በጣም ብዙ ሙከራዎች። እባክዎ ከአንድ ደቂቃ በኋላ ይሞክሩ።",
    errGeneric: "የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    errNetwork: "የኔትወርክ ችግር። ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።",
  },
};

const STORAGE_KEY = "onset-lang";
const CHANGE_EVENT = "onset-lang-change";

export function setLanguage(code: LanguageCode) {
  localStorage.setItem(STORAGE_KEY, code);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): LanguageCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isLanguageCode(stored) ? stored : "en";
}

export function useLanguage() {
  const code = useSyncExternalStore<LanguageCode>(
    subscribe,
    getSnapshot,
    () => "en",
  );

  const { script, dir } = getLanguage(code);

  useEffect(() => {
    document.documentElement.lang = code;
    document.documentElement.dir = dir;
  }, [code, dir]);

  return {
    code,
    dir,
    setLanguage,
    t: TRANSLATIONS[code],
    fontClass: script === "latin" ? "" : `lang-${script}`,
  };
}

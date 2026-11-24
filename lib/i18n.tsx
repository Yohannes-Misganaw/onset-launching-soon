"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getLanguage, isLanguageCode, type LanguageCode } from "@/lib/languages";
import type { AudienceRole, Interest } from "@/lib/survey";

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
  interestsLabel: string;
  interests: Record<Interest, string>;
  rolesLabel: string;
  selectAll: string;
  interestsOtherLabel: string;
  rolesOtherLabel: string;
  stepOf: string;
  continueCta: string;
  backCta: string;
  roles: Record<AudienceRole, string>;
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
  errInterestsRequired: string;
  errRolesRequired: string;
  errInterestsOtherRequired: string;
  errRolesOtherRequired: string;
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
    interestsLabel: "What are you interested in doing on Onset.et?",
    interests: {
      rent_out_equipment: "Rent out my equipment",
      rent_equipment: "Rent equipment from others",
      buy_sell_equipment: "Buy or sell filmmaking equipment",
      find_jobs: "Find film production jobs",
      find_crew: "Find crew members for my productions",
      locations: "List or find filming locations",
      other: "Other",
    },
    rolesLabel: "Which best describes you?",
    selectAll: "Select all that apply.",
    interestsOtherLabel: "Tell us what else you'd like to do",
    rolesOtherLabel: "Tell us how you'd describe yourself",
    stepOf: "Step {current} of {total}",
    continueCta: "Continue",
    backCta: "Back",
    roles: {
      filmmaker: "Individual filmmaker or creative professional",
      equipment_owner: "Equipment owner",
      rental_house: "Equipment rental house or rental business",
      production_company: "Film or production company",
      crew: "Crew member or freelancer",
      location_owner: "Location owner or representative",
      other: "Other",
    },
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
    errInterestsRequired: "Please select at least one thing you're interested in",
    errRolesRequired: "Please select at least one option that describes you",
    errInterestsOtherRequired: "Please tell us what else you're interested in",
    errRolesOtherRequired: "Please tell us how you'd describe yourself",
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
    interestsLabel: "በOnset.et ላይ ምን ማድረግ ይፈልጋሉ?",
    interests: {
      rent_out_equipment: "መሣሪያዬን ማከራየት",
      rent_equipment: "ከሌሎች መሣሪያ መከራየት",
      buy_sell_equipment: "የፊልም መሣሪያዎችን መግዛት ወይም መሸጥ",
      find_jobs: "የፊልም ፕሮዳክሽን ሥራዎችን ማግኘት",
      find_crew: "ለፕሮዳክሽኖቼ የቀረጻ ቡድን አባላትን ማግኘት",
      locations: "የቀረጻ ቦታዎችን መመዝገብ ወይም ማግኘት",
      other: "ሌላ",
    },
    rolesLabel: "እርስዎን በተሻለ የሚገልጸው የትኛው ነው?",
    selectAll: "የሚመለከቱዎትን ሁሉ ይምረጡ።",
    interestsOtherLabel: "ሌላ ምን ማድረግ እንደሚፈልጉ ይንገሩን",
    rolesOtherLabel: "ራስዎን እንዴት እንደሚገልጹ ይንገሩን",
    stepOf: "ደረጃ {current} ከ {total}",
    continueCta: "ቀጥል",
    backCta: "ተመለስ",
    roles: {
      filmmaker: "ግለሰብ ፊልም ሰሪ ወይም የፈጠራ ባለሙያ",
      equipment_owner: "የመሣሪያ ባለቤት",
      rental_house: "የመሣሪያ ኪራይ ድርጅት ወይም ንግድ",
      production_company: "የፊልም ወይም የፕሮዳክሽን ኩባንያ",
      crew: "የቀረጻ ቡድን አባል ወይም ፍሪላንሰር",
      location_owner: "የቀረጻ ቦታ ባለቤት ወይም ተወካይ",
      other: "ሌላ",
    },
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
    errInterestsRequired: "እባክዎ የሚፈልጉትን ቢያንስ አንድ ነገር ይምረጡ",
    errRolesRequired: "እባክዎ እርስዎን የሚገልጽ ቢያንስ አንድ አማራጭ ይምረጡ",
    errInterestsOtherRequired: "እባክዎ ሌላ ምን ማድረግ እንደሚፈልጉ ይጻፉ",
    errRolesOtherRequired: "እባክዎ ራስዎን እንዴት እንደሚገልጹ ይጻፉ",
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

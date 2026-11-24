export const INTERESTS = [
  "rent_out_equipment",
  "rent_equipment",
  "buy_sell_equipment",
  "find_jobs",
  "find_crew",
  "locations",
  "other",
] as const;

export const AUDIENCE_ROLES = [
  "filmmaker",
  "equipment_owner",
  "rental_house",
  "production_company",
  "crew",
  "location_owner",
  "other",
] as const;

export type Interest = (typeof INTERESTS)[number];
export type AudienceRole = (typeof AUDIENCE_ROLES)[number];

export const INTEREST_LABELS: Record<Interest, string> = {
  rent_out_equipment: "Rent out my equipment",
  rent_equipment: "Rent equipment from others",
  buy_sell_equipment: "Buy or sell filmmaking equipment",
  find_jobs: "Find film production jobs",
  find_crew: "Find crew members for my productions",
  locations: "List or find filming locations",
  other: "Other",
};

export const AUDIENCE_ROLE_LABELS: Record<AudienceRole, string> = {
  filmmaker: "Individual filmmaker or creative professional",
  equipment_owner: "Equipment owner",
  rental_house: "Equipment rental house or rental business",
  production_company: "Film or production company",
  crew: "Crew member or freelancer",
  location_owner: "Location owner or representative",
  other: "Other",
};

export function parseChoices<T extends string>(value: unknown, allowed: readonly T[]): T[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === "string" && (allowed as readonly string[]).includes(item))
  ) {
    return null;
  }
  return allowed.filter((item) => value.includes(item));
}

export function storedChoiceLabels<T extends string>(stored: string, labels: Record<T, string>): string[] {
  return stored
    .split(",")
    .filter((item): item is T => Object.hasOwn(labels, item))
    .map((item) => labels[item]);
}

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export interface Country {
  iso: CountryCode;
  dialCode: string;
  englishName: string;
}

export const DEFAULT_COUNTRY_ISO: CountryCode = "ET";

const englishNames = new Intl.DisplayNames(["en"], { type: "region" });

export const COUNTRIES: Country[] = getCountries()
  .map((iso) => ({
    iso,
    dialCode: `+${getCountryCallingCode(iso)}`,
    englishName: englishNames.of(iso) ?? iso,
  }))
  .sort((a, b) => {
    if (a.iso === DEFAULT_COUNTRY_ISO) return -1;
    if (b.iso === DEFAULT_COUNTRY_ISO) return 1;
    return a.englishName.localeCompare(b.englishName);
  });

export function isCountryCode(value: unknown): value is CountryCode {
  return (
    typeof value === "string" &&
    COUNTRIES.some((country) => country.iso === value)
  );
}

export function toE164Phone(phone: string, iso: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(phone, iso);
  if (!parsed || !parsed.isValid() || parsed.country !== iso) {
    return null;
  }
  return parsed.number;
}

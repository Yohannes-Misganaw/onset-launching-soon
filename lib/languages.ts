export const LANGUAGES = [
  { code: "en", label: "English", script: "latin", dir: "ltr" },
  { code: "am", label: "አማርኛ", script: "ethiopic", dir: "ltr" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export interface Language {
  code: LanguageCode;
  label: string;
  script: "latin" | "ethiopic";
  dir: "ltr" | "rtl";
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return (
    typeof value === "string" &&
    LANGUAGES.some((language) => language.code === value)
  );
}

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}

export function getLanguageLabel(value: string): string {
  return LANGUAGES.find((language) => language.code === value)?.label ?? value;
}

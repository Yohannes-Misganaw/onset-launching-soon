"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { RefObject } from "react";
import type { CountryCode } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { COUNTRIES, DEFAULT_COUNTRY_ISO, type Country } from "@/lib/countries";

interface CountryOption extends Country {
  name: string;
}

interface CountryCodePickerProps {
  value: CountryCode;
  onChange: (iso: CountryCode) => void;
  locale: string;
  disabled?: boolean;
  label: string;
  searchPlaceholder: string;
  emptyText: string;
  anchor?: RefObject<HTMLElement | null>;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function matchesCountry(option: CountryOption, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  const digits = needle.replace(/^\+/, "");
  if (/^\d+$/.test(digits)) {
    return option.dialCode.slice(1).startsWith(digits);
  }
  return [option.name, option.englishName, option.iso].some((field) =>
    normalize(field).includes(needle),
  );
}

function Flag({ iso }: { iso: string }) {
  return (
    <Image
      src={`/flags/${iso}.svg`}
      alt=""
      aria-hidden="true"
      width={24}
      height={16}
      unoptimized
      className="h-4 w-6 shrink-0 rounded-[3px] object-cover ring-1 ring-foreground/15"
    />
  );
}

export function CountryCodePicker({
  value,
  onChange,
  locale,
  disabled = false,
  label,
  searchPlaceholder,
  emptyText,
  anchor,
}: CountryCodePickerProps) {
  const options = useMemo<CountryOption[]>(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale, "en"], { type: "region" });
    } catch {
      names = null;
    }
    const collator = new Intl.Collator([locale, "en"]);
    return COUNTRIES.map((country) => ({
      ...country,
      name: names?.of(country.iso) ?? country.englishName,
    })).sort((a, b) => {
      if (a.iso === DEFAULT_COUNTRY_ISO) return -1;
      if (b.iso === DEFAULT_COUNTRY_ISO) return 1;
      return collator.compare(a.name, b.name);
    });
  }, [locale]);

  const selected = options.find((option) => option.iso === value) ?? options[0];

  return (
    <Combobox
      items={options}
      value={selected}
      disabled={disabled}
      autoHighlight
      isItemEqualToValue={(item, current) => item.iso === current.iso}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.iso}
      filter={(item, query) => matchesCountry(item, query)}
      onValueChange={(next) => {
        if (next) onChange(next.iso);
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            aria-label={`${label}: ${selected.name} ${selected.dialCode}`}
          />
        }
        className="h-full shrink-0 gap-2 rounded-none rounded-s-[calc(var(--radius-2xl)-1px)] ps-4 pe-3 text-base font-medium text-foreground hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-0 focus-visible:bg-foreground/[0.08] data-popup-open:bg-foreground/[0.08] dark:hover:bg-foreground/[0.06] [&_[data-slot=combobox-trigger-icon]]:transition-transform [&_[data-slot=combobox-trigger-icon]]:duration-200 data-popup-open:[&_[data-slot=combobox-trigger-icon]]:rotate-180"
      >
        <Flag iso={selected.iso} />
        <span className="tabular-nums">{selected.dialCode}</span>
      </ComboboxTrigger>
      <ComboboxContent
        anchor={anchor}
        sideOffset={8}
        className="w-(--anchor-width) min-w-72 rounded-2xl border border-foreground/12 bg-[#0c2118]/85 p-1.5 text-foreground shadow-2xl shadow-black/60 ring-0 backdrop-blur-2xl backdrop-saturate-150 *:data-[slot=input-group]:m-0.5 *:data-[slot=input-group]:mb-1.5 *:data-[slot=input-group]:h-11 *:data-[slot=input-group]:rounded-xl *:data-[slot=input-group]:border-foreground/12 *:data-[slot=input-group]:bg-background/60"
      >
        <ComboboxInput
          placeholder={searchPlaceholder}
          showTrigger={false}
          aria-label={searchPlaceholder}
          className="text-foreground"
        />
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList className="[scrollbar-color:rgba(249,242,224,0.22)_transparent] [scrollbar-width:thin]">
          {(item: CountryOption) => (
            <ComboboxItem
              key={item.iso}
              value={item}
              className="gap-3 rounded-xl py-2.5 ps-3 pe-9 text-[0.9375rem] data-highlighted:bg-foreground/10 data-highlighted:text-foreground data-selected:text-accent"
            >
              <Flag iso={item.iso} />
              <span className="flex-1 truncate">{item.name}</span>
              <span className="text-muted-foreground tabular-nums">{item.dialCode}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

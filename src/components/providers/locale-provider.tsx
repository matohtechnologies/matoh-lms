"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/navigation";
import idMessages from "../../../messages/id.json";
import enMessages from "../../../messages/en.json";
import { setUserLocale } from "@/i18n/actions";

const MESSAGES_MAP: Record<string, any> = {
  id: idMessages,
  en: enMessages,
};

interface LocaleContextType {
  locale: "id" | "en";
  switchLocale: (newLocale: "id" | "en") => void;
  isPending: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "id",
  switchLocale: () => {},
  isPending: false,
});

export function useAppLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: string;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<"id" | "en">(
    initialLocale === "en" ? "en" : "id"
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (initialLocale === "en" || initialLocale === "id") {
      setLocale(initialLocale);
    }
  }, [initialLocale]);

  const switchLocale = (newLocale: "id" | "en") => {
    if (newLocale === locale) return;

    // 1. Instant client update (0ms delay, no reload needed)
    setLocale(newLocale);

    // 2. Immediate document cookies update
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // 3. Server-side cookie sync & complete reload for all Server and Client components
    startTransition(async () => {
      try {
        await setUserLocale(newLocale);
      } catch (e) {
        console.error("Failed to persist locale to server", e);
      }
      window.location.reload();
    });
  };

  const currentMessages = MESSAGES_MAP[locale] || idMessages;

  return (
    <LocaleContext.Provider value={{ locale, switchLocale, isPending }}>
      <NextIntlClientProvider locale={locale} messages={currentMessages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

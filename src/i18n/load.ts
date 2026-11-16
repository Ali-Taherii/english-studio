import type { Locale } from "./config";

// Loads a message file for a known locale. No dependency on the request, so server actions
// and emails can use it too; pages should call getDictionary() from ./dictionaries instead.
const loaders = {
  fa: () => import("./messages/fa.json").then((m) => m.default),
  en: () => import("./messages/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof loaders)["en"]>>;

export const loadDictionary = (locale: Locale): Promise<Dictionary> => loaders[locale]();

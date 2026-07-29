import { describe, expect, it } from "vitest";

import { getSupportedLanguage, resolveLanguage } from "../lib/language";

describe("resolveLanguage", () => {
  it.each([
    ["pl-PL", "pl"],
    ["uk-UA", "uk"],
    ["ru-RU", "ru"],
    ["en-US", "en"],
  ] as const)("maps %s to %s", (browserLanguage, expected) => {
    expect(resolveLanguage(null, [], browserLanguage)).toBe(expected);
  });

  it("falls back to English for an unsupported browser language", () => {
    expect(resolveLanguage(null, [], "de-DE")).toBe("en");
  });

  it("uses the first supported entry from navigator.languages", () => {
    expect(resolveLanguage(null, ["de-DE", "uk-UA", "pl-PL"], "en-US")).toBe(
      "uk",
    );
  });

  it("keeps a valid saved manual choice ahead of browser preferences", () => {
    expect(resolveLanguage("ru", ["pl-PL"], "pl-PL")).toBe("ru");
  });

  it("ignores an invalid saved value and continues with browser detection", () => {
    expect(resolveLanguage("invalid", ["pl-PL"], "en-US")).toBe("pl");
  });
});

describe("getSupportedLanguage", () => {
  it("normalizes a supported regional language tag", () => {
    expect(getSupportedLanguage("UK-ua")).toBe("uk");
  });
});

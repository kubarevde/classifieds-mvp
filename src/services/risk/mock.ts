import type { RiskSignalType } from "./types";

export const HIGH_RISK_CATEGORIES = new Set<string>([
  "electronics",
  "auto",
  "autos",
  "real_estate",
  "real-estate",
  "jobs",
]);

export const CATEGORY_BASELINE_PRICE: Record<string, number> = {
  electronics: 65000,
  auto: 850000,
  autos: 850000,
  real_estate: 4500000,
  services: 15000,
  agriculture: 120000,
  base: 50000,
};

export const SUSPICIOUS_MESSAGE_PATTERNS: { phrase: string; type: RiskSignalType }[] = [
  { phrase: "telegram", type: "off_platform_contact" },
  { phrase: "whatsapp", type: "off_platform_contact" },
  { phrase: "перейд", type: "off_platform_contact" },
  { phrase: "переведи на карту", type: "off_platform_payment" },
  { phrase: "предоплата", type: "off_platform_payment" },
  { phrase: "оплата вне платформы", type: "off_platform_payment" },
  { phrase: "вне платформы", type: "suspicious_message_pattern" },
  { phrase: "ссылка на оплату", type: "suspicious_message_pattern" },
];


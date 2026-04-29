import type { Metadata } from "next";

import { VerificationHubClient } from "./VerificationHubClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Подтверждение профиля - Classify",
  description: "Подтвердите личность или магазин, чтобы повысить доверие и безопасность сделок на Classify.",
  path: "/verification",
});

export default function VerificationHubPage() {
  return <VerificationHubClient />;
}


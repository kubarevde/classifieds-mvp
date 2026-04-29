import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { EnforcementHubClient } from "./EnforcementHubClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Решения платформы и пересмотр",
  description: "Информация о действиях платформы, ограничениях и обращениях на пересмотр в Classify.",
  path: "/enforcement",
});

export default function EnforcementHubPage() {
  return <EnforcementHubClient />;
}


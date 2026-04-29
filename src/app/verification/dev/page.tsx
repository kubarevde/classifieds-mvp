import { notFound } from "next/navigation";

import { VerificationDevPanel } from "./VerificationDevPanel";

export default function VerificationDevPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <VerificationDevPanel />;
}


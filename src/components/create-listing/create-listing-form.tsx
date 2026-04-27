"use client";

import { CreateListingWizard } from "@/components/create-listing/create-listing-wizard";
import type { CatalogWorld } from "@/lib/listings";

type CreateListingFormProps = {
  initialWorld?: CatalogWorld;
  initialIsAuthenticated?: boolean;
};

export function CreateListingForm({
  initialWorld = "all",
  initialIsAuthenticated = true,
}: CreateListingFormProps) {
  return <CreateListingWizard initialWorld={initialWorld} initialIsAuthenticated={initialIsAuthenticated} />;
}

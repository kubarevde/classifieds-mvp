import { CreateListingPageShell } from "@/components/create-listing/create-listing-page-shell";
import { Navbar } from "@/components/layout/navbar";
import { CatalogWorld } from "@/lib/listings";

type CreateListingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function resolveWorld(raw: string | string[] | undefined): CatalogWorld {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const allowed: CatalogWorld[] = [
    "all",
    "electronics",
    "autos",
    "agriculture",
    "real_estate",
    "jobs",
    "services",
  ];
  if (value && allowed.includes(value as CatalogWorld)) {
    return value as CatalogWorld;
  }
  return "all";
}

function resolveIsAuthenticated(raw: string | string[] | undefined): boolean {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value !== "1";
}

export default async function CreateListingPage({ searchParams }: CreateListingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialWorld = resolveWorld(params?.world);
  const initialIsAuthenticated = resolveIsAuthenticated(params?.guest);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <CreateListingPageShell initialWorld={initialWorld} initialIsAuthenticated={initialIsAuthenticated} />
    </div>
  );
}

import { CreateListingForm } from "@/components/create-listing/create-listing-form";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
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
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <header className="space-y-2">
            <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              Публикация объявления
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Подать объявление
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Заполните форму, выберите тематический мир и опубликуйте объявление за пару минут.
            </p>
          </header>

          <CreateListingForm initialWorld={initialWorld} initialIsAuthenticated={initialIsAuthenticated} />
        </Container>
      </main>
    </div>
  );
}

import { agricultureListings } from "@/lib/agriculture";
import { electronicsListings } from "@/lib/electronics";
import { allListings, categoryLabels } from "@/lib/listings";
import type { ListingCategory } from "@/lib/types";

export type DiscoveryPricePreference = "expensive" | "cheap";
export type DiscoveryGeoPreference = "my_city" | "all_russia";
export type DiscoveryIntentPreference =
  | "machinery"
  | "materials"
  | "service"
  | "farming"
  | "any";

export type DiscoveryAnswers = {
  price: DiscoveryPricePreference;
  geo: DiscoveryGeoPreference;
  intent: DiscoveryIntentPreference;
};

export type ElectronicsDiscoveryBudget = "budget" | "mid" | "premium";
export type ElectronicsDiscoveryUseCase = "work" | "gaming" | "content" | "study" | "cheap";
export type ElectronicsDiscoveryCondition = "new" | "used" | "any";

export type ElectronicsDiscoveryAnswers = {
  budget: ElectronicsDiscoveryBudget;
  useCase: ElectronicsDiscoveryUseCase;
  condition: ElectronicsDiscoveryCondition;
};

export type DiscoveryListing = {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  publishedAt: string;
  image: string;
  condition: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
  categoryLabel: string;
  themeLabel: "База каталога" | "Сельское хозяйство" | "Электроника";
};

export const DISCOVERY_DEFAULT_CITY = "Москва";
export type TechMatchIntent = "work" | "gaming" | "content";

function mapBaseCategoryLabel(category: ListingCategory) {
  return categoryLabels[category];
}

export const discoveryCatalog: DiscoveryListing[] = [
  ...allListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    priceValue: listing.priceValue,
    location: listing.location,
    publishedAt: listing.publishedAt,
    image: listing.image,
    condition: listing.condition,
    description: listing.description,
    sellerName: listing.sellerName,
    sellerPhone: listing.sellerPhone,
    categoryLabel: mapBaseCategoryLabel(listing.category),
    themeLabel: "База каталога" as const,
  })),
  ...agricultureListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    priceValue: listing.priceValue,
    location: listing.location,
    publishedAt: listing.publishedAt,
    image: listing.image,
    condition: listing.condition,
    description: listing.description,
    sellerName: listing.sellerName,
    sellerPhone: listing.sellerPhone,
    categoryLabel: listing.categoryLabel,
    themeLabel: "Сельское хозяйство" as const,
  })),
  ...electronicsListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    priceValue: listing.priceValue,
    location: listing.location,
    publishedAt: listing.publishedAt,
    image: listing.image,
    condition: listing.condition,
    description: listing.description,
    sellerName: listing.sellerName,
    sellerPhone: listing.sellerPhone,
    categoryLabel: listing.categoryLabel,
    themeLabel: "Электроника" as const,
  })),
];

export function resolveDiscoveryListings(
  answers: DiscoveryAnswers,
  userCity = DISCOVERY_DEFAULT_CITY,
  options?: {
    world?: "all" | "agriculture" | "electronics";
  },
): DiscoveryListing[] {
  const byWorld = discoveryCatalog.filter((listing) => {
    if (!options?.world || options.world === "all") {
      return true;
    }

    if (options.world === "agriculture") {
      return listing.themeLabel === "Сельское хозяйство";
    }

    return listing.themeLabel === "Электроника";
  });

  const byIntent = byWorld.filter((listing) => {
    if (answers.intent === "any") {
      return true;
    }

    if (answers.intent === "machinery") {
      return ["трактора", "оборудование", "навесное", "прицеп"].some((keyword) =>
        listing.categoryLabel.toLowerCase().includes(keyword),
      );
    }

    if (answers.intent === "materials") {
      return ["готовая продукция", "овощ", "фрук", "зелень"].some((keyword) =>
        listing.categoryLabel.toLowerCase().includes(keyword),
      );
    }

    if (answers.intent === "service") {
      return ["бизнес", "земля"].some((keyword) =>
        listing.categoryLabel.toLowerCase().includes(keyword),
      );
    }

    return ["ягод", "земля", "овощ", "фрук"].some((keyword) =>
      listing.categoryLabel.toLowerCase().includes(keyword),
    );
  });

  const byGeo =
    answers.geo === "my_city"
      ? byIntent.filter((listing) => listing.location === userCity)
      : byIntent;

  const sortedByPrice = [...byGeo].sort((a, b) =>
    answers.price === "expensive" ? b.priceValue - a.priceValue : a.priceValue - b.priceValue,
  );

  return sortedByPrice.slice(0, 18);
}

export function resolveTechMatchListings(
  intent: TechMatchIntent,
  userCity = DISCOVERY_DEFAULT_CITY,
): DiscoveryListing[] {
  const electronicsOnly = discoveryCatalog.filter((listing) => listing.themeLabel === "Электроника");

  const byIntent = electronicsOnly.filter((listing) => {
    const normalizedCategory = listing.categoryLabel.toLowerCase();
    const normalizedTitle = listing.title.toLowerCase();

    if (intent === "work") {
      return ["ноут", "пк", "смартфон"].some(
        (keyword) => normalizedCategory.includes(keyword) || normalizedTitle.includes(keyword),
      );
    }

    if (intent === "gaming") {
      return ["консол", "игров", "видеокарт"].some(
        (keyword) => normalizedCategory.includes(keyword) || normalizedTitle.includes(keyword),
      );
    }

    return ["фото", "аудио", "камера"].some(
      (keyword) => normalizedCategory.includes(keyword) || normalizedTitle.includes(keyword),
    );
  });

  const prioritized = byIntent.sort((a, b) => {
    if (a.location === userCity && b.location !== userCity) {
      return -1;
    }
    if (b.location === userCity && a.location !== userCity) {
      return 1;
    }
    return b.priceValue - a.priceValue;
  });

  return prioritized.slice(0, 6);
}

export function resolveElectronicsDiscoveryListings(
  answers: ElectronicsDiscoveryAnswers,
  userCity = DISCOVERY_DEFAULT_CITY,
) {
  const electronicsOnly = discoveryCatalog.filter((listing) => listing.themeLabel === "Электроника");

  const byBudget = electronicsOnly.filter((listing) => {
    if (answers.budget === "budget") {
      return listing.priceValue <= 60000;
    }
    if (answers.budget === "mid") {
      return listing.priceValue > 60000 && listing.priceValue <= 130000;
    }
    return listing.priceValue > 130000;
  });

  const byUseCase = byBudget.filter((listing) => {
    const label = listing.categoryLabel.toLowerCase();
    const title = listing.title.toLowerCase();

    if (answers.useCase === "work") {
      return ["ноут", "пк", "смартфон"].some(
        (keyword) => label.includes(keyword) || title.includes(keyword),
      );
    }

    if (answers.useCase === "gaming") {
      return ["игров", "консол", "видеокарт"].some(
        (keyword) => label.includes(keyword) || title.includes(keyword),
      );
    }

    if (answers.useCase === "content") {
      return ["фото", "аудио", "камера", "микрофон"].some(
        (keyword) => label.includes(keyword) || title.includes(keyword),
      );
    }

    if (answers.useCase === "study") {
      return ["ноут", "смартфон", "аудио"].some(
        (keyword) => label.includes(keyword) || title.includes(keyword),
      );
    }

    return listing.priceValue <= 80000;
  });

  const byCondition = byUseCase.filter((listing) => {
    if (answers.condition === "any") {
      return true;
    }

    const normalizedCondition = listing.condition.toLowerCase();
    const looksNew = ["как новый", "гарант", "идеаль", "нов"].some((keyword) =>
      normalizedCondition.includes(keyword),
    );

    return answers.condition === "new" ? looksNew : !looksNew;
  });

  const prioritized = [...byCondition].sort((a, b) => {
    if (a.location === userCity && b.location !== userCity) {
      return -1;
    }
    if (b.location === userCity && a.location !== userCity) {
      return 1;
    }

    if (answers.budget === "budget") {
      return a.priceValue - b.priceValue;
    }

    return b.priceValue - a.priceValue;
  });

  return prioritized.slice(0, 18);
}

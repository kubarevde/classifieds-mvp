export type ListingCategory =
  | "auto"
  | "electronics"
  | "real_estate"
  | "services";

export type Listing = {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  publishedAt: string;
  postedAtIso: string;
  category: ListingCategory;
  image: string;
  condition: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
};

export type Category = {
  id: ListingCategory;
  label: string;
  caption: string;
  icon: string;
  listingCount: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: string;
};

import { CatalogWorld } from "@/lib/listings";

export type ContactMethod = "phone" | "chat" | "both";

export type ListingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type CreateListingFormData = {
  world: CatalogWorld;
  title: string;
  category: string;
  subCategory: string;
  price: string;
  city: string;
  description: string;
  sellerName: string;
  phone: string;
  contactMethod: ContactMethod | "";
};

export type FormErrors = Partial<Record<keyof CreateListingFormData | "images", string>>;

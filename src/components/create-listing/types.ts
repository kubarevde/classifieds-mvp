import { ListingCategory } from "@/lib/types";

export type ContactMethod = "phone" | "chat" | "both";

export type ListingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type CreateListingFormData = {
  title: string;
  category: ListingCategory | "";
  price: string;
  city: string;
  description: string;
  sellerName: string;
  phone: string;
  contactMethod: ContactMethod | "";
};

export type FormErrors = Partial<Record<keyof CreateListingFormData | "images", string>>;

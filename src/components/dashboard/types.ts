import { ListingCategory } from "@/lib/types";

export type DashboardListingStatus = "active" | "draft" | "hidden" | "sold";

export type DashboardFilter = "all" | DashboardListingStatus;

export type DashboardListing = {
  id: string;
  title: string;
  price: string;
  category: ListingCategory;
  city: string;
  publishedAt: string;
  image: string;
  status: DashboardListingStatus;
  views: number;
};

export type SellerProfile = {
  name: string;
  city: string;
  avatarInitials: string;
  phone: string;
  memberSince: string;
};

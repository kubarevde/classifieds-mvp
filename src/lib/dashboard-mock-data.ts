import { SellerProfile, DashboardListing } from "@/components/dashboard/types";

export const sellerProfileMock: SellerProfile = {
  name: "Дмитрий Кубарев",
  city: "Москва",
  avatarInitials: "ДК",
  phone: "+7 (999) 100-22-33",
  memberSince: "с 2023 года",
};

export const myListingsMock: DashboardListing[] = [
  {
    id: "my-1",
    title: "Toyota Camry 2020, 2.5 AT, один владелец",
    price: "2 490 000 ₽",
    category: "auto",
    city: "Москва",
    publishedAt: "20 апр 2026",
    image: "from-zinc-700 via-slate-500 to-slate-300",
    status: "active",
    views: 325,
  },
  {
    id: "my-2",
    title: "iPhone 15 Pro 256GB, Natural Titanium",
    price: "94 500 ₽",
    category: "electronics",
    city: "Санкт-Петербург",
    publishedAt: "19 апр 2026",
    image: "from-slate-600 via-zinc-400 to-slate-100",
    status: "draft",
    views: 41,
  },
  {
    id: "my-3",
    title: "2-к квартира, 56 м², рядом с метро",
    price: "11 900 000 ₽",
    category: "real_estate",
    city: "Казань",
    publishedAt: "18 апр 2026",
    image: "from-cyan-800 via-sky-500 to-sky-100",
    status: "hidden",
    views: 189,
  },
  {
    id: "my-4",
    title: "PlayStation 5 Slim + 2 геймпада",
    price: "54 000 ₽",
    category: "electronics",
    city: "Москва",
    publishedAt: "14 апр 2026",
    image: "from-indigo-900 via-blue-700 to-cyan-200",
    status: "sold",
    views: 612,
  },
];

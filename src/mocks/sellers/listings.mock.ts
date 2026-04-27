import type { ListingPromotionState } from "@/entities/marketing/model";
import type { SellerPost } from "@/entities/seller/model";

export const sellerPostsMock: SellerPost[] = [
  {
    id: "post-alexey-1",
    sellerId: "alexey-drive",
    type: "news",
    title: "Новые авто с прозрачной историей уже в подборке",
    body: "Добавили 4 проверенных автомобиля с полной сервисной историей и осмотром перед сделкой.",
    createdAt: "2026-04-18T09:00:00.000Z",
    pinned: true,
  },
  {
    id: "post-alexey-2",
    sellerId: "alexey-drive",
    type: "promo",
    title: "Скидка на подбор до конца недели",
    body: "Для новых клиентов действует специальный тариф на подбор автомобиля и сопровождение сделки.",
    createdAt: "2026-04-16T14:30:00.000Z",
  },
  {
    id: "post-marina-1",
    sellerId: "marina-tech",
    type: "product",
    title: "MacBook Air M2 в near-new состоянии",
    body: "Новая партия ноутбуков с диагностикой и чеком проверки перед выдачей покупателю.",
    createdAt: "2026-04-19T11:20:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "post-marina-2",
    sellerId: "marina-tech",
    type: "video",
    title: "Видео-обзор актуальных смартфонов",
    body: "Собрали короткий обзор моделей с лучшим балансом цены и состояния на этой неделе.",
    createdAt: "2026-04-14T18:10:00.000Z",
  },
  {
    id: "post-pclab-1",
    sellerId: "pc-lab",
    type: "promo",
    title: "Комплект сборки ПК со скидкой",
    body: "До пятницы действуют пакетные предложения на игровые сборки и периферию.",
    createdAt: "2026-04-17T12:00:00.000Z",
  },
  {
    id: "post-pclab-2",
    sellerId: "pc-lab",
    type: "news",
    title: "Пополнение по видеокартам",
    body: "Доступны свежие поставки RTX и Radeon с проверкой и гарантийным периодом магазина.",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "post-agro-don-1",
    sellerId: "agro-don",
    type: "news",
    title: "Новый урожай в каталоге",
    body: "Открыли предзаказ на сезонные позиции для розницы и HoReCa с гибкой логистикой.",
    createdAt: "2026-04-15T08:40:00.000Z",
  },
];
export const sellerPromotionStateMock: ListingPromotionState[] = [
  {
    sellerId: "alexey-drive",
    listingId: "1",
    lastBoostedAt: "2026-04-20T09:30:00.000Z",
    isSuper: false,
    isSponsored: true,
  },
  {
    sellerId: "marina-tech",
    listingId: "2",
    lastBoostedAt: "2026-04-19T15:20:00.000Z",
    isSuper: true,
    isSponsored: true,
  },
  {
    sellerId: "pc-lab",
    listingId: "tech-4",
    lastBoostedAt: "2026-04-18T13:10:00.000Z",
    isSuper: true,
    isSponsored: false,
  },
  {
    sellerId: "pc-lab",
    listingId: "tech-8",
    lastBoostedAt: "2026-04-21T08:05:00.000Z",
    isSuper: false,
    isSponsored: true,
  },
];
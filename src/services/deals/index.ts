/**
 * Сервис сделок и офферов (P32). Реализация по умолчанию — `mock.ts`;
 * для продакшена замените wiring на HTTP-клиент с тем же контрактом (`http.ts`).
 */
import { createMockDealsService } from "./mock";

import type { Deal, Offer } from "./types";

export type { Deal, DealEvent, DealEventType, DealStatus, Offer, OfferStatus } from "./types";

export interface DealsService {
  getDealById(id: string): Deal | undefined;
  getDealsForUser(userId: string): Deal[];
  getDealsForSeller(sellerId: string): Deal[];
  getActiveDealsForListing(listingId: string): Deal[];
  /** Все сделки по объявлению (любой статус), для админки / отзывов. */
  getDealsForListing(listingId: string): Deal[];
  getOffersForListing(listingId: string): Offer[];
  getOffersForUser(userId: string): Offer[];

  createOffer(params: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    message?: string;
  }): Promise<Offer>;

  acceptOffer(offerId: string, actorId: string): Promise<Deal>;
  declineOffer(offerId: string, actorId: string, note?: string): Promise<Offer>;
  counterOffer(offerId: string, actorId: string, counterAmount: number, note?: string): Promise<Offer>;

  markDealCompletedByBuyer(dealId: string, actorId: string): Promise<Deal>;
  markDealCompletedBySeller(dealId: string, actorId: string): Promise<Deal>;
  cancelDeal(dealId: string, actorId: string, reason: string): Promise<Deal>;
  openDisputeForDeal(dealId: string, actorId: string, note?: string): Promise<Deal>;
}

export const dealsService: DealsService = createMockDealsService();

export { createMockDealsService } from "./mock";

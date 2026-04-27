import { z } from "zod";

import type { CatalogWorld } from "@/lib/listings";

import type { ListingSaleMode } from "@/stores/listing-draft-store";

const worlds = [
  "all",
  "electronics",
  "autos",
  "agriculture",
  "real_estate",
  "jobs",
  "services",
] as const satisfies readonly CatalogWorld[];

export const catalogWorldEnum = z.enum(worlds);

export const listingSaleModeEnum = z.enum(["fixed", "auction", "free"]);

const pricePattern = /^\d+([.,]\d{1,2})?$/;

export const contactMethodEnum = z.enum(["phone", "chat", "both"]);

export const wizardCoreSchema = z.object({
  world: catalogWorldEnum,
  category: z.string().min(1, "Выберите категорию"),
  subCategory: z.string().optional(),
  saleMode: listingSaleModeEnum,
  title: z.string().min(3, "Заголовок слишком короткий"),
  description: z.string().min(20, "Описание должно быть не короче 20 символов"),
  price: z.string(),
  condition: z.string().min(1, "Укажите состояние"),
  city: z.string().min(1, "Выберите город"),
  contactMethod: z.union([z.literal(""), contactMethodEnum]),
  availability: z.enum(["weekdays", "weekends", "evenings", "flexible"]),
  sellerName: z.string(),
  phone: z.string(),
  useProfileContacts: z.boolean(),
  isAuthenticated: z.boolean(),
  wantPromotion: z.boolean(),
  promotePeriod: z.enum(["day", "week", "month"]),
  promoteScope: z.enum(["global", "world"]),
  auctionStartPrice: z.string(),
  auctionReservePrice: z.string(),
  auctionStartNow: z.boolean(),
  auctionStartAt: z.string(),
  auctionDurationHours: z.union([z.literal(12), z.literal(24), z.literal(72), z.literal(168)]),
  auctionAntiSnipingEnabled: z.boolean(),
  auctionMinBidIncrement: z.string(),
});

export type WizardCoreValues = z.infer<typeof wizardCoreSchema>;

export const step1Schema = wizardCoreSchema.pick({
  world: true,
  category: true,
  subCategory: true,
  saleMode: true,
});

export function buildStep2Schema(saleMode: ListingSaleMode) {
  return wizardCoreSchema
    .pick({
      title: true,
      description: true,
      price: true,
      condition: true,
    })
    .superRefine((data, ctx) => {
      if (saleMode === "free" || saleMode === "auction") {
        return;
      }
      const trimmed = data.price.trim();
      if (!trimmed) {
        ctx.addIssue({ code: "custom", message: "Укажите цену", path: ["price"] });
        return;
      }
      if (!pricePattern.test(trimmed)) {
        ctx.addIssue({
          code: "custom",
          message: "Введите цену в формате 1000 или 1000.50",
          path: ["price"],
        });
        return;
      }
      const amount = Number.parseFloat(trimmed.replace(",", "."));
      if (!Number.isFinite(amount) || amount <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Цена должна быть больше 0",
          path: ["price"],
        });
      }
    });
}

export function buildAuctionSettingsSchema(saleMode: ListingSaleMode) {
  return wizardCoreSchema
    .pick({
      auctionStartPrice: true,
      auctionReservePrice: true,
      auctionStartNow: true,
      auctionStartAt: true,
      auctionDurationHours: true,
      auctionMinBidIncrement: true,
    })
    .superRefine((data, ctx) => {
      if (saleMode !== "auction") {
        return;
      }

      const startPrice = Number.parseFloat(data.auctionStartPrice.replace(",", "."));
      if (!Number.isFinite(startPrice) || startPrice <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Стартовая цена должна быть больше 0",
          path: ["auctionStartPrice"],
        });
      }

      const reserveRaw = data.auctionReservePrice.trim();
      if (reserveRaw) {
        const reserve = Number.parseFloat(reserveRaw.replace(",", "."));
        if (!Number.isFinite(reserve) || reserve < startPrice) {
          ctx.addIssue({
            code: "custom",
            message: "Резервная цена должна быть не ниже стартовой",
            path: ["auctionReservePrice"],
          });
        }
      }

      if (!data.auctionStartNow) {
        const startAtMs = Date.parse(data.auctionStartAt);
        if (!Number.isFinite(startAtMs)) {
          ctx.addIssue({
            code: "custom",
            message: "Укажите дату и время старта",
            path: ["auctionStartAt"],
          });
        }
      }

      const minIncrementRaw = data.auctionMinBidIncrement.trim();
      if (minIncrementRaw) {
        const minIncrement = Number.parseFloat(minIncrementRaw.replace(",", "."));
        if (!Number.isFinite(minIncrement) || minIncrement <= 0) {
          ctx.addIssue({
            code: "custom",
            message: "Минимальный шаг должен быть больше 0",
            path: ["auctionMinBidIncrement"],
          });
        } else if (Number.isFinite(startPrice) && startPrice > 0 && minIncrement > startPrice * 0.2) {
          ctx.addIssue({
            code: "custom",
            message: "Минимальный шаг не должен превышать 20% стартовой цены",
            path: ["auctionMinBidIncrement"],
          });
        }
      }
    });
}

export const step4Schema = wizardCoreSchema.pick({
  city: true,
  contactMethod: true,
  availability: true,
  sellerName: true,
  phone: true,
  useProfileContacts: true,
  isAuthenticated: true,
});

export function buildStep4Schema(options: { skipManualContacts: boolean }) {
  return step4Schema.superRefine((data, ctx) => {
    if (!data.contactMethod) {
      ctx.addIssue({ code: "custom", message: "Выберите способ связи", path: ["contactMethod"] });
    }
    if (options.skipManualContacts) {
      return;
    }
    if (!data.sellerName.trim()) {
      ctx.addIssue({ code: "custom", message: "Укажите имя пользователя", path: ["sellerName"] });
    }
    if (!data.phone.trim()) {
      ctx.addIssue({ code: "custom", message: "Укажите номер телефона", path: ["phone"] });
    } else if (!/^[+\d()\s-]{10,20}$/.test(data.phone.trim())) {
      ctx.addIssue({ code: "custom", message: "Введите корректный номер телефона", path: ["phone"] });
    }
  });
}

export const fullPublishSchema = wizardCoreSchema.superRefine((data, ctx) => {
  const mergeIssues = (result: z.ZodSafeParseResult<unknown>) => {
    if (result.success) {
      return;
    }
    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: "custom",
        message: issue.message,
        path: issue.path as (string | number)[],
      });
    }
  };

  mergeIssues(step1Schema.safeParse(data));
  mergeIssues(buildStep2Schema(data.saleMode).safeParse(data));
  mergeIssues(buildAuctionSettingsSchema(data.saleMode).safeParse(data));
  const skipContacts = data.isAuthenticated && data.useProfileContacts;
  mergeIssues(buildStep4Schema({ skipManualContacts: skipContacts }).safeParse(data));
});

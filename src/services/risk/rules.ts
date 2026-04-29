import { getVerificationProfile } from "@/services/verification";

import { CATEGORY_BASELINE_PRICE, HIGH_RISK_CATEGORIES, SUSPICIOUS_MESSAGE_PATTERNS } from "./mock";
import type { RiskLevel, RiskSignal, RiskSignalType, TransactionSafetyChecklistItem } from "./types";

type ListingLike = {
  id: string;
  title: string;
  priceValue?: number;
  categoryId?: string;
  category?: string;
};

type SellerLike = {
  id: string;
  memberSinceYear?: number;
};

function mkSignal(type: RiskSignalType, level: RiskLevel, title: string, description: string, recommendation: string): RiskSignal {
  return {
    id: `risk-${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    level,
    title,
    description,
    recommendation,
  };
}

function normalizeCategoryId(listing: ListingLike): string {
  return listing.categoryId ?? listing.category ?? "base";
}

function reduceLevelForVerifiedStore(level: RiskLevel, sellerId?: string): RiskLevel {
  if (!sellerId) return level;
  const storeProfile = getVerificationProfile(sellerId, "store");
  if (!storeProfile || storeProfile.status !== "verified" || storeProfile.level !== "business") {
    return level;
  }
  if (level === "high") return "medium";
  return "low";
}

export function detectListingRisk(
  listing: ListingLike,
  seller?: SellerLike | null,
  context?: { duplicateCount?: number },
): RiskSignal[] {
  const categoryId = normalizeCategoryId(listing);
  const signals: RiskSignal[] = [];
  const currentYear = new Date().getFullYear();

  if (HIGH_RISK_CATEGORIES.has(categoryId)) {
    signals.push(
      mkSignal(
        "high_risk_category",
        reduceLevelForVerifiedStore("medium", seller?.id),
        "Категория требует дополнительной внимательности",
        "Для этой категории важно проверить условия сделки и профиль продавца.",
        "Сверьте профиль, условия передачи товара и способ оплаты перед сделкой.",
      ),
    );
  }

  if (seller?.memberSinceYear && currentYear - seller.memberSinceYear <= 1 && HIGH_RISK_CATEGORIES.has(categoryId)) {
    signals.push(
      mkSignal(
        "new_seller_high_value_item",
        reduceLevelForVerifiedStore("high", seller.id),
        "Новый продавец в категории с высокой стоимостью",
        "У продавца небольшой срок активности для этой категории.",
        "Уточните детали сделки в чате и проверьте подтверждение профиля перед оплатой.",
      ),
    );
  }

  const baseline = CATEGORY_BASELINE_PRICE[categoryId] ?? CATEGORY_BASELINE_PRICE.base;
  if (typeof listing.priceValue === "number" && baseline > 0 && listing.priceValue <= baseline * 0.6) {
    signals.push(
      mkSignal(
        "price_too_low",
        reduceLevelForVerifiedStore("medium", seller?.id),
        "Цена заметно ниже типичной для категории",
        "Цена может быть выгодной, но стоит дополнительно проверить описание и условия сделки.",
        "Сверьте комплектность, документы и условия передачи товара до оплаты.",
      ),
    );
  }

  if (seller?.id) {
    const storeVerification = getVerificationProfile(seller.id, "store");
    const sellerVerification = getVerificationProfile(seller.id, "seller");
    const storeVerified = storeVerification?.status === "verified" && storeVerification.level === "business";
    const identityVerified = sellerVerification?.status === "verified" && sellerVerification.level === "identity";
    if (!storeVerified && !identityVerified) {
      signals.push(
        mkSignal(
          "unverified_store",
          "medium",
          "Профиль продавца пока без полного подтверждения",
          "Подтверждённый профиль обычно повышает предсказуемость сделки.",
          "Проверьте профиль и при необходимости запросите больше деталей перед оплатой.",
        ),
      );
    }
  }

  if ((context?.duplicateCount ?? 0) > 1) {
    signals.push(
      mkSignal(
        "duplicate_listing",
        "medium",
        "Похожие карточки в выдаче",
        "Есть повторяющиеся похожие объявления. Это не нарушение, но повод проверить детали.",
        "Сравните описание, контакты и условия в похожих объявлениях.",
      ),
    );
  }

  return signals.sort((a, b) => (a.level === b.level ? 0 : a.level === "high" ? -1 : a.level === "low" ? 1 : -1));
}

export function detectMessageRisk(messageText: string): RiskSignal[] {
  const normalized = messageText.toLowerCase();
  const hits = SUSPICIOUS_MESSAGE_PATTERNS.filter((p) => normalized.includes(p.phrase));
  if (!hits.length) {
    return [];
  }

  const hasPayment = hits.some((h) => h.type === "off_platform_payment");
  const hasOffPlatform = hits.some((h) => h.type === "off_platform_contact");

  const signals: RiskSignal[] = [];
  if (hasOffPlatform) {
    signals.push(
      mkSignal(
        "off_platform_contact",
        "medium",
        "Просят перейти в сторонний мессенджер",
        "Часть рисковых сценариев начинается с перевода общения вне платформы.",
        "Старайтесь фиксировать важные договорённости в чате платформы.",
      ),
    );
  }
  if (hasPayment) {
    signals.push(
      mkSignal(
        "off_platform_payment",
        "high",
        "Обсуждается оплата вне платформы",
        "Оплата вне платформы повышает риск спорной или небезопасной сделки.",
        "Не переводите деньги без проверки условий и подтверждения продавца.",
      ),
    );
  }
  if (!hasPayment && hits.length > 1) {
    signals.push(
      mkSignal(
        "suspicious_message_pattern",
        "medium",
        "Есть формулировки повышенного риска",
        "В сообщении встречаются шаблонные фразы из риск-паттернов.",
        "Проверьте условия и при сомнениях используйте центр безопасности.",
      ),
    );
  }
  return signals;
}

export function detectRequestRisk(request: {
  categoryId?: string;
  title?: string;
  description?: string;
  budget?: { min?: number; max?: number };
}): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const categoryId = request.categoryId ?? "";
  const text = `${request.title ?? ""} ${request.description ?? ""}`.toLowerCase();

  if (HIGH_RISK_CATEGORIES.has(categoryId)) {
    signals.push(
      mkSignal(
        "high_risk_category",
        "medium",
        "Запрос в категории с повышенным риском",
        "Для дорогих и чувствительных категорий важно заранее уточнять условия и этапы сделки.",
        "Фиксируйте ключевые договорённости в чате и проверяйте профиль откликающихся продавцов.",
      ),
    );
  }

  if (text.includes("предоплата") || text.includes("карта") || text.includes("паспорт")) {
    signals.push(
      mkSignal(
        "suspicious_message_pattern",
        "medium",
        "Проверьте формулировки запроса",
        "В тексте встречаются чувствительные слова по оплате/персональным данным.",
        "Не публикуйте лишние личные и банковские данные в открытом запросе.",
      ),
    );
  }

  return signals;
}

export function getTransactionSafetyChecklist(context?: { includeVerification?: boolean }): TransactionSafetyChecklistItem[] {
  const base: TransactionSafetyChecklistItem[] = [
    { id: "public-place", text: "Встречайтесь в публичном месте." },
    { id: "inspect-before-pay", text: "Осматривайте товар до оплаты." },
    { id: "no-suspicious-links", text: "Не переходите по подозрительным ссылкам." },
    { id: "no-prepay", text: "Не отправляйте предоплату без достаточных оснований." },
  ];
  if (context?.includeVerification !== false) {
    return [{ id: "check-profile", text: "Проверьте профиль продавца или магазина." }, ...base];
  }
  return base;
}


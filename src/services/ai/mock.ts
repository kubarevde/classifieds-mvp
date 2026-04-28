import { delayMs, getPriceRecommendationMock, improveTextMock } from "@/lib/ai-mock";
import {
  filterAndSortUnifiedListings,
  getCategoryOptionsForWorld,
  unifiedCatalogListings,
} from "@/lib/listings";
import type { CatalogWorld } from "@/lib/listings";

import type { AIIssue, AIListingAssistant, SnapAndFillResult } from "@/services/ai/listing-assistant";

function hasKeyword(input: string, keywords: string[]): boolean {
  return keywords.some((keyword) => input.includes(keyword));
}

function normalizePhotoNames(photos: string[]): string {
  return photos.join(" ").toLowerCase();
}

function genericClarificationResult(): SnapAndFillResult {
  return {
    world: "electronics",
    category: "computer_goods",
    title: "Товар в хорошем состоянии",
    description:
      "Товар использовался аккуратно. Комплектация и состояние уточнены по фото и ответам владельца. Возможна проверка при встрече.",
    condition: "good",
    price: {
      min: 7000,
      max: 15000,
      recommended: 10900,
      reasoning: "После уточнений ИИ предлагает базовый рыночный диапазон в рублях.",
    },
    tags: ["Техника", "Проверка", "Самовывоз"],
    confidence: 0.62,
    needsClarification: false,
  };
}

function inferWorldFromText(text: string): CatalogWorld {
  const t = text.toLowerCase();
  if (hasKeyword(t, ["iphone", "macbook", "ноутбук", "телефон", "смартфон", "электрон"])) {
    return "electronics";
  }
  if (hasKeyword(t, ["bmw", "авто", "машин", "автомоб"])) {
    return "autos";
  }
  if (hasKeyword(t, ["квартир", "недвижим", "дом "])) {
    return "real_estate";
  }
  return "electronics";
}

export function buildListingFromClarifications(answers: string[]): SnapAndFillResult {
  const joined = answers.join(" ").toLowerCase();
  if (hasKeyword(joined, ["телефон", "iphone", "смартфон"])) {
    return {
      world: "electronics",
      category: "phones",
      title: "Смартфон, хорошее состояние",
      description: "Смартфон в рабочем состоянии. Есть следы использования, все основные функции исправны.",
      condition: "good",
      price: {
        min: 12000,
        max: 26000,
        recommended: 18900,
        reasoning: "После уточнений определён сегмент смартфонов среднего класса.",
      },
      tags: ["Смартфон", "Б/у"],
      confidence: 0.74,
      needsClarification: false,
    };
  }
  return genericClarificationResult();
}

export function createListingAssistantMock(): AIListingAssistant {
  return {
    async generateTitle({ categoryId, worldId, description }) {
      await delayMs();
      const cat = categoryId || "товар";
      const base = description?.trim().slice(0, 80) || `Объявление в категории ${cat}`;
      return {
        suggestions: [
          `${base} — проверенное качество`,
          `${base} · быстрая сделка`,
          `${base} (${worldId ?? "маркетплейс"})`,
        ],
        confidence: description && description.length > 40 ? 0.82 : 0.58,
      };
    },

    async generateDescription({ title, categoryId, condition }) {
      await delayMs();
      const cond = condition ?? "good";
      const text = `${title.trim() || "Товар"}. Состояние: ${cond}. Комплектация уточняется по фото; возможна проверка при встрече. Категория: ${categoryId}.`;
      return {
        text,
        highlights: ["Состояние", "Комплектация", "Сделка"],
      };
    },

    async suggestPrice({ title, categoryId, condition, location }) {
      await delayMs();
      const seed = title.length * 1000 + categoryId.length * 100;
      const base = 15000 + (seed % 40000);
      const loc = location?.toLowerCase().includes("москв") ? 1.08 : 1;
      const min = Math.round(base * 0.85 * loc);
      const max = Math.round(base * 1.15 * loc);
      const recommended = Math.round((min + max) / 2);
      const comparablesList = filterAndSortUnifiedListings(unifiedCatalogListings, {
        query: title.slice(0, 24).toLowerCase(),
        category: categoryId || "all",
        location: "all",
        sortBy: "newest",
        saleMode: "all",
      });
      return {
        min,
        max,
        recommended,
        reasoning: `Диапазон с учётом категории «${categoryId}», состояния «${condition}» и региона «${location || "не указан"}»; сверено с ${Math.min(12, comparablesList.length)} похожими карточками каталога.`,
        comparables: Math.min(12, comparablesList.length),
      };
    },

    async suggestCategory({ title, description }) {
      await delayMs();
      const blob = `${title} ${description}`.toLowerCase();
      const world = inferWorldFromText(blob);
      const options = getCategoryOptionsForWorld(world);
      if (!options.length) {
        return [{ categoryId: "services", worldId: "services", confidence: 0.4 }];
      }
      const seed = (title.length + description.length) % Math.max(1, options.length);
      const rotated = [...options.slice(seed), ...options.slice(0, seed)];
      return rotated.slice(0, 3).map((o, i) => ({
        categoryId: o.id,
        worldId: world,
        confidence: 0.88 - i * 0.07,
      }));
    },

    async improveText({ text, type }) {
      await delayMs(400, 900);
      return improveTextMock(text, type);
    },

    async detectProblems({ title, description, price, categoryId }) {
      await delayMs(400, 800);
      const issues: AIIssue[] = [];
      let score = 100;
      if (title.trim().length < 8) {
        issues.push({
          field: "title",
          severity: "warning",
          message: "Заголовок короткий — добавьте модель и ключевой атрибут.",
          fix: "Расширить заголовок",
        });
        score -= 12;
      }
      if (description.trim().length < 40) {
        issues.push({
          field: "description",
          severity: "suggestion",
          message: "Описание можно усилить деталями комплектации и состояния.",
        });
        score -= 10;
      }
      if (!Number.isFinite(price) || price <= 0) {
        issues.push({
          field: "price",
          severity: "error",
          message: "Укажите цену больше 0 для фиксированной продажи.",
        });
        score -= 25;
      }
      if (!categoryId) {
        issues.push({
          field: "title",
          severity: "warning",
          message: "Категория не выбрана — хуже релевантность в поиске.",
        });
        score -= 15;
      }
      return { issues, score: Math.max(0, score) };
    },

    async snapAndFillFromPhotos({ photos }) {
      await delayMs(900, 1500);
      const normalized = normalizePhotoNames(photos);

      if (hasKeyword(normalized, ["iphone", "phone", "смартфон"])) {
        return {
          world: "electronics",
          category: "phones",
          title: "iPhone 14 Pro 128GB, отличное состояние",
          description:
            "Оригинальный iPhone 14 Pro на 128GB, без ремонтов, с бережной эксплуатацией. Face ID работает, батарея в хорошем состоянии, есть кабель.",
          condition: "excellent",
          price: {
            min: 65000,
            max: 83000,
            recommended: 74900,
            reasoning: "Для iPhone 14 Pro 128GB в хорошем состоянии похожие предложения чаще в диапазоне 65 000 - 83 000 ₽.",
          },
          tags: ["iPhone", "Apple", "128GB"],
          confidence: 0.93,
          needsClarification: false,
        };
      }

      if (hasKeyword(normalized, ["macbook", "laptop", "ноутбук"])) {
        return {
          world: "electronics",
          category: "laptops",
          title: "MacBook Air M1 8/256, отличное состояние",
          description:
            "MacBook Air M1 в аккуратном состоянии: экран без дефектов, клавиатура и батарея в норме. Подходит для работы и учебы.",
          condition: "excellent",
          price: {
            min: 52000,
            max: 78000,
            recommended: 64900,
            reasoning: "Для MacBook Air M1 на вторичном рынке типичный коридор 52 000 - 78 000 ₽ в зависимости от ресурса батареи.",
          },
          tags: ["MacBook", "Apple Silicon", "Laptop"],
          confidence: 0.9,
          needsClarification: false,
        };
      }

      return {
        world: "",
        category: "",
        title: "",
        description: "",
        condition: "good",
        price: {
          min: 0,
          max: 0,
          recommended: 0,
          reasoning: "Нужны уточнения по товару для корректной оценки.",
        },
        tags: [],
        confidence: 0.3,
        needsClarification: true,
        clarificationQuestions: [
          "Что именно вы продаёте?",
          "Какое состояние?",
          "Есть ли оригинальная упаковка?",
        ],
      };
    },

    async analyzePhotoForTags({ fileName }) {
      await delayMs(1000, 1600);
      const n = fileName.toLowerCase();
      if (hasKeyword(n, ["img", "photo", "dsc", "png", "jpg"])) {
        if (hasKeyword(n, ["phone", "iphone", "pixel"])) {
          return { detectedLabel: "Смартфон", tags: ["iPhone", "Apple", "128GB"] };
        }
        return { detectedLabel: "Товар общей категории", tags: ["Б/у", "Самовывоз", "Проверка"] };
      }
      return { detectedLabel: "Товар", tags: ["Фото", "Объявление"] };
    },
  };
}

/** Рекомендация цены через существующий текстовый мок (совместимо с create-listing). */
export function suggestPriceFromAiMock(input: {
  category: string;
  title: string;
  price: string;
}): { min: number; max: number; recommended: number; reasoning: string } {
  const r = getPriceRecommendationMock({
    category: input.category,
    title: input.title,
    price: input.price || "50000",
  });
  const mid = Math.round((r.suggestedMin + r.suggestedMax) / 2);
  return {
    min: r.suggestedMin,
    max: r.suggestedMax,
    recommended: mid,
    reasoning: r.rationale,
  };
}

export type SnapAndFillCondition = "new" | "excellent" | "good" | "used";

export type SnapAndFillPrice = {
  min: number;
  max: number;
  recommended: number;
  reasoning: string;
};

export type SnapAndFillResult = {
  world: string;
  category: string;
  title: string;
  description: string;
  condition: SnapAndFillCondition;
  price: SnapAndFillPrice;
  tags: string[];
  confidence: number;
  needsClarification: boolean;
  clarificationQuestions?: string[];
};

export interface AIListingAssistant {
  snapAndFillFromPhotos(params: { photos: string[] }): Promise<SnapAndFillResult>;
}

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

export function createMockAIListingAssistant(): AIListingAssistant {
  return {
    async snapAndFillFromPhotos({ photos }) {
      await new Promise((resolve) => setTimeout(resolve, 1300));
      const normalized = normalizePhotoNames(photos);

      if (hasKeyword(normalized, ["iphone", "phone", "смартфон"])) {
        return {
          world: "electronics",
          category: "smartphones",
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
  };
}

export function buildListingFromClarifications(answers: string[]): SnapAndFillResult {
  const joined = answers.join(" ").toLowerCase();
  if (hasKeyword(joined, ["телефон", "iphone", "смартфон"])) {
    return {
      world: "electronics",
      category: "smartphones",
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

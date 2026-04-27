type AiListingSuggestionInput = {
  title: string;
  category: string;
  price: string;
};

type AiListingSuggestionResult = {
  titleSuggestion: string;
  descriptionSuggestion: string;
  priceTip: string;
};

export type PriceRecommendationInput = {
  category: string;
  title: string;
  price: string;
};

export type PriceRecommendationResult = {
  suggestedMin: number;
  suggestedMax: number;
  rationale: string;
};

export function getPriceRecommendationMock(input: PriceRecommendationInput): PriceRecommendationResult {
  const base = Number.parseFloat(input.price.replace(",", ".")) || 50_000;
  const spread = Math.max(5000, Math.round(base * 0.12));
  return {
    suggestedMin: Math.max(0, Math.round(base - spread)),
    suggestedMax: Math.round(base + spread),
    rationale: `Для «${input.title.trim() || "товара"}» в категории «${input.category.trim() || "общая"}» рынок обычно колеблется в этом коридоре: от ${Math.max(0, Math.round(base - spread)).toLocaleString("ru-RU")} ₽ до ${Math.round(base + spread).toLocaleString("ru-RU")} ₽.`,
  };
}

export function getAiListingSuggestions(input: AiListingSuggestionInput): AiListingSuggestionResult {
  const cleanTitle = input.title.trim() || "Отличное предложение";
  const cleanCategory = input.category.trim() || "категории";
  const cleanPrice = input.price.trim() || "рыночной";

  return {
    titleSuggestion: `${cleanTitle} - проверенное предложение в ${cleanCategory}`,
    descriptionSuggestion:
      "Состояние: отличное. Комплектация: как на фото. Готов к быстрой сделке, возможна проверка при встрече.",
    priceTip: `Рекомендуем проверить цену рядом с ${cleanPrice} и добавить аргумент торга в описании.`,
  };
}

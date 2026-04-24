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

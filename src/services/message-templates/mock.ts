import type { MessageSenderRole } from "@/services/messages";

import type { MessageTemplate } from "./types";

const templates: MessageTemplate[] = [
  { id: "tpl-1", roleScope: "all", title: "Приветствие", text: "Здравствуйте! Спасибо за сообщение.", category: "greeting" },
  { id: "tpl-2", roleScope: "seller", title: "Товар актуален", text: "Здравствуйте! Да, товар актуален.", category: "availability" },
  { id: "tpl-3", roleScope: "store_owner", title: "Доп. фото", text: "Могу отправить дополнительные фото в этом чате.", category: "availability" },
  { id: "tpl-4", roleScope: "seller", title: "Доставка", text: "Доставка возможна, обычно 1-2 дня по городу.", category: "delivery" },
  { id: "tpl-5", roleScope: "store_owner", title: "Самовывоз", text: "Самовывоз доступен сегодня после 18:00.", category: "delivery" },
  { id: "tpl-6", roleScope: "seller", title: "По цене", text: "По цене можем обсудить небольшой торг при встрече.", category: "price" },
  { id: "tpl-7", roleScope: "store_owner", title: "Счёт и документы", text: "Можем выставить счёт и отправить документы в чат.", category: "price" },
  { id: "tpl-8", roleScope: "buyer", title: "Уточнение наличия", text: "Подскажите, пожалуйста, предложение ещё актуально?", category: "availability" },
  { id: "tpl-9", roleScope: "buyer", title: "Уточнение условий", text: "Какие условия доставки и оплаты сейчас доступны?", category: "delivery" },
  { id: "tpl-10", roleScope: "all", title: "Отвечу позже", text: "Спасибо за интерес, отвечу подробнее чуть позже.", category: "follow_up" },
  { id: "tpl-11", roleScope: "seller", title: "Запрос параметров", text: "Уточните, пожалуйста, удобное время и формат получения.", category: "follow_up" },
  { id: "tpl-12", roleScope: "store_owner", title: "Следующий шаг", text: "Если всё подходит, можем зафиксировать детали и перейти к сделке.", category: "follow_up" },
];

export async function getTemplatesForRole(role: MessageSenderRole): Promise<MessageTemplate[]> {
  return templates.filter((template) => template.roleScope === "all" || template.roleScope === role);
}

export async function getSuggestedTemplates(input: {
  role: MessageSenderRole;
  hasListingContext?: boolean;
  hasRequestContext?: boolean;
}): Promise<MessageTemplate[]> {
  const base = await getTemplatesForRole(input.role);
  if (input.role === "buyer") {
    return base.slice(0, 4);
  }
  const preferred = base.filter((template) => {
    if (input.hasListingContext) return template.category === "availability" || template.category === "price";
    if (input.hasRequestContext) return template.category === "delivery" || template.category === "follow_up";
    return template.category === "greeting" || template.category === "follow_up";
  });
  return (preferred.length > 0 ? preferred : base).slice(0, 4);
}


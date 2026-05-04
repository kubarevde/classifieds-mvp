import type { MessageSenderRole } from "@/services/messages";

import type { MessageTemplate } from "./types";

const templates: MessageTemplate[] = [
  { id: "tpl-1", roleScope: "all", label: "Приветствие", body: "Здравствуйте! Спасибо за сообщение.", category: "greeting" },
  { id: "tpl-2", roleScope: "seller", label: "Товар актуален", body: "Здравствуйте! Да, товар актуален.", category: "availability" },
  { id: "tpl-13", roleScope: "store_owner", label: "Да, в наличии", body: "Да, позиция в наличии, могу зарезервировать на сегодня.", category: "availability" },
  { id: "tpl-14", roleScope: "store_owner", label: "Ещё фото", body: "Могу отправить ещё фото с разных ракурсов — напишите, что важно показать.", category: "availability" },
  { id: "tpl-15", roleScope: "store_owner", label: "Забрать сегодня", body: "Можно забрать сегодня после 17:00, напишите удобный интервал.", category: "delivery" },
  { id: "tpl-16", roleScope: "store_owner", label: "Цена окончательная", body: "Цена на карточке окончательная, без скрытых доплат.", category: "price" },
  { id: "tpl-17", roleScope: "store_owner", label: "Цена обсуждаема", body: "По цене готовы обсудить разумный торг при быстрой сделке.", category: "price" },
  { id: "tpl-3", roleScope: "store_owner", label: "Доп. фото", body: "Могу отправить дополнительные фото в этом чате.", category: "availability" },
  { id: "tpl-4", roleScope: "seller", label: "Доставка", body: "Доставка возможна, обычно 1-2 дня по городу.", category: "delivery" },
  { id: "tpl-5", roleScope: "store_owner", label: "Самовывоз", body: "Самовывоз доступен сегодня после 18:00.", category: "delivery" },
  { id: "tpl-6", roleScope: "seller", label: "По цене", body: "По цене можем обсудить небольшой торг при встрече.", category: "price" },
  { id: "tpl-7", roleScope: "store_owner", label: "Счёт и документы", body: "Можем выставить счёт и отправить документы в чат.", category: "price" },
  { id: "tpl-8", roleScope: "buyer", label: "Уточнение наличия", body: "Подскажите, пожалуйста, предложение ещё актуально?", category: "availability" },
  { id: "tpl-9", roleScope: "buyer", label: "Уточнение условий", body: "Какие условия доставки и оплаты сейчас доступны?", category: "delivery" },
  { id: "tpl-10", roleScope: "all", label: "Отвечу позже", body: "Спасибо за интерес, отвечу подробнее чуть позже.", category: "follow_up" },
  { id: "tpl-11", roleScope: "seller", label: "Запрос параметров", body: "Уточните, пожалуйста, удобное время и формат получения.", category: "follow_up" },
  { id: "tpl-12", roleScope: "store_owner", label: "Следующий шаг", body: "Если всё подходит, можем зафиксировать детали и перейти к сделке.", category: "follow_up" },
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
    if (input.hasListingContext) {
      return (
        template.category === "availability" ||
        template.category === "price" ||
        template.id === "tpl-15" ||
        template.id === "tpl-14"
      );
    }
    if (input.hasRequestContext) return template.category === "delivery" || template.category === "follow_up";
    return template.category === "greeting" || template.category === "follow_up";
  });
  return (preferred.length > 0 ? preferred : base).slice(0, 6);
}

import type { AdminInternalNote } from "./types";

export type AdminNoteEntityType =
  | "user"
  | "listing"
  | "store"
  | "support"
  | "moderation"
  | "subscription"
  | "case"
  | "promotion"
  | "promo_campaign";

function storageKey(type: AdminNoteEntityType, entityId: string): string {
  return `${type}:${entityId}`;
}

const notesByKey = new Map<string, AdminInternalNote[]>();

function seed() {
  const seedRows: Array<[AdminNoteEntityType, string, AdminInternalNote[]]> = [
    [
      "user",
      "buyer-account:buyer-dmitriy",
      [{ id: "seed-u1", at: new Date(Date.now() - 86400000 * 2).toISOString(), author: "Поддержка", text: "VIP-покупатель, быстрые ответы." }],
    ],
    [
      "listing",
      "2",
      [{ id: "seed-l1", at: new Date(Date.now() - 86400000).toISOString(), author: "Модерация", text: "Проверена цена vs медиана по категории." }],
    ],
    [
      "support",
      "ticket-2",
      [{ id: "seed-s1", at: new Date(Date.now() - 3600000).toISOString(), author: "Биллинг", text: "Запрошен акт, ожидаем выгрузку." }],
    ],
    [
      "subscription",
      "sub-marina-tech",
      [{ id: "seed-b1", at: new Date(Date.now() - 7200000).toISOString(), author: "Финансы", text: "Past due — отслеживаем повтор списания." }],
    ],
    [
      "moderation",
      "mr-1001",
      [{ id: "seed-m1", at: new Date(Date.now() - 4000000).toISOString(), author: "Модератор", text: "Связанный риск-контекст по магазину (mock)." }],
    ],
    [
      "case",
      "case-marina-billing",
      [{ id: "seed-c1", at: new Date(Date.now() - 5400000).toISOString(), author: "Поддержка", text: "Связка: подписка past due + тикет по счёту (mock)." }],
    ],
    [
      "case",
      "case-buyer-safety",
      [{ id: "seed-c2", at: new Date(Date.now() - 900000).toISOString(), author: "Модератор", text: "Кросс-доменный кейс: тикеты + пользователь (mock)." }],
    ],
    [
      "promotion",
      "prm-001",
      [{ id: "seed-p1", at: new Date(Date.now() - 1800000).toISOString(), author: "Финансы", text: "Проверить соответствие слота и CTR (mock)." }],
    ],
  ];
  for (const [type, id, notes] of seedRows) {
    notesByKey.set(storageKey(type, id), notes);
  }
}

seed();

export function getAdminEntityNotes(type: AdminNoteEntityType, entityId: string): AdminInternalNote[] {
  const list = notesByKey.get(storageKey(type, entityId)) ?? [];
  return [...list].sort((a, b) => b.at.localeCompare(a.at));
}

export function getAdminEntityNoteCount(type: AdminNoteEntityType, entityId: string): number {
  return notesByKey.get(storageKey(type, entityId))?.length ?? 0;
}

export function appendAdminEntityNote(type: AdminNoteEntityType, entityId: string, author: string, text: string): AdminInternalNote {
  const trimmed = text.trim();
  const note: AdminInternalNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    author,
    text: trimmed,
  };
  const k = storageKey(type, entityId);
  notesByKey.set(k, [note, ...(notesByKey.get(k) ?? [])]);
  return note;
}

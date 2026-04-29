import type {
  VerificationLevel,
  VerificationProfile,
  VerificationRequirement,
  VerificationStatus,
  VerificationSubjectType,
} from "./types";

export type VerificationStartInput = {
  userId: string;
  subjectType: VerificationSubjectType;
  level?: VerificationLevel;
};

export type VerificationStepSubmitInput = {
  userId: string;
  subjectType: VerificationSubjectType;
  level: VerificationLevel;
  requirementKey: VerificationRequirement["key"];
  requirementId?: string;
  /** Финализация потока (после последнего шага). В демо выставляем status=pending. */
  finalize?: boolean;
};

const DEMO_BUYER_ID = "buyer-dmitriy";
const DEMO_SELLER_ID = "marina-tech";

type ProfileKey = `${VerificationSubjectType}:${string}`;

function mkProfileKey(subjectType: VerificationSubjectType, userId: string): ProfileKey {
  return `${subjectType}:${userId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildChecklist(level: VerificationLevel): Omit<VerificationRequirement, "completed">[] {
  if (level === "basic") {
    return [
      {
        id: "req-email",
        key: "email",
        title: "Подтвердите email",
        description: "В демо достаточно пройти шаг подтверждения в интерфейсе.",
      },
      {
        id: "req-phone",
        key: "phone",
        title: "Подтвердите телефон",
        description: "В демо достаточно пройти шаг подтверждения в интерфейсе.",
      },
    ];
  }

  if (level === "identity") {
    return [
      {
        id: "req-phone",
        key: "phone",
        title: "Подтвердите телефон",
        description: "Шаг подтверждения телефона (mock).",
      },
      {
        id: "req-email",
        key: "email",
        title: "Подтвердите email",
        description: "Шаг подтверждения email (mock).",
      },
      {
        id: "req-identity-doc",
        key: "identity",
        title: "Загрузите документ",
        description: "Загрузка документа (UI-only).",
      },
      {
        id: "req-identity-selfie",
        key: "identity",
        title: "Selfie / live-check",
        description: "Live-check (UI-only).",
      },
    ];
  }

  if (level === "business") {
    return [
      {
        id: "req-business-docs",
        key: "business_docs",
        title: "Документы магазина",
        description: "ИНН/регистрационные данные и документ (mock).",
      },
      {
        id: "req-address",
        key: "address",
        title: "Адрес и контакт",
        description: "Контакт и адрес для связи (mock).",
      },
    ];
  }

  // trusted_plus (derived) — в демо требования не нужны
  return [];
}

function defaultStatusForStart(level: VerificationLevel): VerificationStatus {
  // В демо после submit шагов показываем pending, а окончательное подтверждение — только через preseed/будущий backend
  return level === "trusted_plus" ? "verified" : "pending";
}

function seedProfiles(): Map<ProfileKey, VerificationProfile> {
  const map = new Map<ProfileKey, VerificationProfile>();
  const buyerChecklist = buildChecklist("basic");
  map.set(mkProfileKey("buyer", DEMO_BUYER_ID), {
    id: "vp-buyer-basic-1",
    userId: DEMO_BUYER_ID,
    subjectType: "buyer",
    status: "verified",
    level: "basic",
    verifiedAt: nowIso(),
    requirements: buyerChecklist.map((r) => ({ ...r, completed: true })),
  });

  const sellerChecklist = buildChecklist("identity");
  map.set(mkProfileKey("seller", DEMO_SELLER_ID), {
    id: "vp-seller-identity-1",
    userId: DEMO_SELLER_ID,
    subjectType: "seller",
    status: "verified",
    level: "identity",
    verifiedAt: nowIso(),
    requirements: sellerChecklist.map((r) => ({ ...r, completed: true })),
  });

  const storeChecklist = buildChecklist("business");
  map.set(mkProfileKey("store", DEMO_SELLER_ID), {
    id: "vp-store-business-1",
    userId: DEMO_SELLER_ID,
    subjectType: "store",
    status: "pending",
    level: "business",
    submittedAt: nowIso(),
    requirements: storeChecklist.map((r, idx) => ({ ...r, completed: idx === 0 ? false : false })),
  });

  return map;
}

// In-memory mock store (no localStorage).
const profiles = seedProfiles();

export function getVerificationProfile(userId: string, subjectType?: VerificationSubjectType): VerificationProfile | null {
  if (subjectType) {
    const existing = profiles.get(mkProfileKey(subjectType, userId));
    if (existing) return existing;
    const defaultLevel: VerificationLevel = subjectType === "buyer" ? "basic" : subjectType === "store" ? "business" : "identity";
    return ensureProfile(userId, subjectType, defaultLevel);
  }

  // Если subjectType не указан — возвращаем "самый релевантный" профиль по приоритету.
  const candidates: VerificationProfile[] = [];
  (["buyer", "seller", "store"] as VerificationSubjectType[]).forEach((t) => {
    const p = profiles.get(mkProfileKey(t, userId));
    if (p) candidates.push(p);
  });
  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => {
    const score = (x: VerificationProfile) => {
      const statusWeight = x.status === "verified" ? 3 : x.status === "pending" ? 2 : x.status === "needs_review" ? 1 : 0;
      const levelWeight = x.level === "trusted_plus" ? 3 : x.level === "business" ? 2 : x.level === "identity" ? 1 : 0;
      return statusWeight * 10 + levelWeight;
    };
    return score(b) - score(a);
  });

  return candidates[0] ?? null;
}

function ensureProfile(userId: string, subjectType: VerificationSubjectType, level: VerificationLevel): VerificationProfile {
  const key = mkProfileKey(subjectType, userId);
  const existing = profiles.get(key);
  if (existing) {
    return existing;
  }

  const checklistTemplate = buildChecklist(level);
  const p: VerificationProfile = {
    id: `vp-${subjectType}-${userId}-${level}`,
    userId,
    subjectType,
    status: "not_started",
    level,
    requirements: checklistTemplate.map((r) => ({ ...r, completed: false })),
    verifiedAt: null,
    submittedAt: null,
    rejectionReason: null,
  };
  profiles.set(key, p);
  return p;
}

function setProfile(p: VerificationProfile) {
  profiles.set(mkProfileKey(p.subjectType, p.userId), { ...p, updatedAt: nowIso() });
}

export function startVerification(input: VerificationStartInput): VerificationProfile {
  const level = input.level ?? (input.subjectType === "store" ? "business" : input.subjectType === "buyer" ? "basic" : "identity");
  const p = ensureProfile(input.userId, input.subjectType, level);

  const checklistTemplate = buildChecklist(level);
  const resetRequirements: VerificationRequirement[] = checklistTemplate.map((r) => ({
    ...r,
    completed: false,
  }));

  const next: VerificationProfile = {
    ...p,
    status: defaultStatusForStart(level),
    level,
    verifiedAt: null,
    submittedAt: null,
    rejectionReason: null,
    requirements: resetRequirements,
  };

  setProfile(next);
  return next;
}

export function submitVerificationStep(input: VerificationStepSubmitInput): VerificationProfile {
  const p = ensureProfile(input.userId, input.subjectType, input.level);
  const nextRequirements = p.requirements.map((r) => {
    if (input.requirementId) {
      return r.id === input.requirementId ? { ...r, completed: true } : r;
    }
    if (r.key !== input.requirementKey) {
      return r;
    }
    // In mock we complete whole requirement group when step indicates a key.
    return { ...r, completed: true };
  });

  let nextStatus: VerificationStatus = p.status;
  let nextSubmittedAt: string | null | undefined = p.submittedAt;
  let nextVerifiedAt: string | null | undefined = p.verifiedAt;

  if (input.finalize) {
    nextStatus = defaultStatusForStart(p.level);
    nextSubmittedAt = nowIso();
    nextVerifiedAt = null;
  } else {
    // Progress: keep pending so UI can show "на проверке" during steps (mock UX).
    nextStatus = p.status === "not_started" ? "pending" : p.status;
  }

  const next: VerificationProfile = {
    ...p,
    requirements: nextRequirements,
    status: nextStatus,
    submittedAt: nextSubmittedAt,
    verifiedAt: nextVerifiedAt,
  };

  setProfile(next);
  return next;
}

export function getVerificationChecklist(input: { userId: string; subjectType: VerificationSubjectType; level: VerificationLevel }): VerificationRequirement[] {
  const p = ensureProfile(input.userId, input.subjectType, input.level);
  return p.requirements;
}

export function getVerificationBenefits(level: VerificationLevel): string[] {
  if (level === "basic") {
    return ["Больше доверия покупателей", "Быстрее первые отклики", "Базовая безопасность сделок (mock)"];
  }
  if (level === "identity") {
    return ["Подтверждённый профиль", "Меньше поводов для сомнений", "Повышенная вероятность отклика"];
  }
  if (level === "business") {
    return ["Магазин прошёл проверку", "Сильный сигнал доверия", "В будущем — приоритет в trust surfaces (mock)"];
  }
  return ["Приоритетный статус и доверительные витрины (derived, mock)"];
}

export function getVerificationSuggestedNextStep(profile: VerificationProfile): { level: VerificationLevel; label: string } | null {
  if (profile.status === "rejected") {
    return { level: profile.level, label: "Исправить данные и отправить повторно" };
  }
  if (profile.status === "needs_review") {
    return { level: profile.level, label: "Дозаполнить недостающие шаги" };
  }
  if (profile.status === "not_started") {
    return { level: profile.level, label: "Начать проверку" };
  }
  if (profile.status === "pending") {
    return { level: profile.level, label: "Ожидает модерации (mock)" };
  }
  return null;
}

export function getVerificationDerivedTrustedPlus(profile: VerificationProfile): VerificationProfile {
  // trusted_plus derived: mock based on verified higher level
  if (profile.status !== "verified") {
    return profile;
  }
  if (profile.level !== "business") {
    return profile;
  }
  const next: VerificationProfile = {
    ...profile,
    level: "trusted_plus",
  };
  return next;
}

export function forceVerificationStatus(input: {
  userId: string;
  subjectType: VerificationSubjectType;
  level: VerificationLevel;
  status: VerificationStatus;
  rejectionReason?: string | null;
}): VerificationProfile {
  const template = buildChecklist(input.level);
  const completedByStatus: boolean =
    input.status === "verified" || input.status === "pending" || input.status === "needs_review";

  const nextRequirements: VerificationRequirement[] = template.map((r) => ({
    ...r,
    completed: completedByStatus,
  }));

  const base = ensureProfile(input.userId, input.subjectType, input.level);

  const submittedAt = input.status === "not_started" ? null : nowIso();
  const verifiedAt = input.status === "verified" ? nowIso() : null;

  const next: VerificationProfile = {
    ...base,
    level: input.level,
    status: input.status,
    requirements: nextRequirements,
    rejectionReason:
      input.rejectionReason === undefined
        ? base.rejectionReason ?? null
        : input.rejectionReason,
    submittedAt,
    verifiedAt,
    // rejection => verifiedAt should be null; kept for UI convenience
  };

  if (input.status === "rejected" || input.status === "needs_review") {
    if (input.rejectionReason !== undefined) {
      next.rejectionReason = input.rejectionReason ?? null;
    } else {
      next.rejectionReason = base.rejectionReason ?? "Требуются дополнительные данные (mock).";
    }
  }

  setProfile(next);
  return next;
}


"use client";

import { useRouter } from "next/navigation";
import { createElement, useEffect, useMemo, useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle2, ChevronLeft, ChevronRight, GripVertical, ImagePlus, Loader2, Star } from "lucide-react";

import { useBuyer } from "@/components/buyer/buyer-provider";
import { FormField } from "@/components/create-listing/form-field";
import { Input } from "@/components/create-listing/input";
import { Select } from "@/components/create-listing/select";
import { Textarea } from "@/components/create-listing/textarea";
import { ListingPreviewCard } from "@/components/listings/listing-preview-card";
import { InlineNotice, SectionCard, UpgradeBanner } from "@/components/platform";
import { useProfile } from "@/components/profile/profile-provider";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { useSubscription } from "@/components/subscription/subscription-provider";
import { Button, buttonVariants } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import {
  buildAuctionSettingsSchema,
  buildStep2Schema,
  buildStep4Schema,
  fullPublishSchema,
  step1Schema,
  type WizardCoreValues,
} from "@/components/create-listing/create-listing-schema";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import {
  buildListingForStore,
  conditionLabel,
  formatWizardPrice,
  listingImageClass,
  type LocalPhoto,
} from "@/components/create-listing/create-listing-wizard-utils";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { getAiListingSuggestions, getPriceRecommendationMock } from "@/lib/ai-mock";
import {
  getCategoryOptionsForWorld,
  getSubcategoryOptionsForWorld,
  getUniqueLocationsForUnified,
  getWorldLabel,
  type CatalogWorld,
  type UnifiedCatalogListing,
} from "@/lib/listings";
import { catalogWorldLucideIcons } from "@/config/icons";
import { getWorldPresentation } from "@/lib/worlds";
import type { HeroBannerPeriod, HeroBannerScope, HeroBannerWorld } from "@/lib/hero-board";
import type { SnapAndFillResult } from "@/services/ai/listing-assistant";
import { buildListingFromClarifications, createMockAIListingAssistant } from "@/services/ai/listing-assistant";
import { getMinimumNextBid } from "@/services/auctions";
import { mockAuctionService } from "@/services/auctions";
import { mockListingsService } from "@/services/listings";
import { getListingDraftDefaults, useListingDraftStore, type DraftPhoto } from "@/stores/listing-draft-store";
import { usePublishedListingStore } from "@/stores/published-listing-store";

const STEP_LABELS = [
  "Фото и ИИ",
  "Категория и мир",
  "Описание и цена",
  "Фото",
  "Локация и контакты",
  "Предпросмотр",
] as const;

const CONDITION_OPTIONS = [
  { id: "new", label: "Новое" },
  { id: "excellent", label: "Отличное" },
  { id: "good", label: "Хорошее" },
  { id: "used", label: "Б/у" },
] as const;

const AVAILABILITY_OPTIONS = [
  { id: "weekdays", label: "Будни" },
  { id: "weekends", label: "Выходные" },
  { id: "evenings", label: "Вечером" },
  { id: "flexible", label: "Договоримся" },
] as const;

const contactMethods = [
  { id: "phone", label: "Только звонки" },
  { id: "chat", label: "Только сообщения" },
  { id: "both", label: "Звонки и сообщения" },
] as const;

const worldCardIds: Exclude<CatalogWorld, "all">[] = [
  "electronics",
  "autos",
  "agriculture",
  "real_estate",
  "jobs",
  "services",
];

function makePhotoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read-error"));
    reader.readAsDataURL(file);
  });
}

type PreviewMode = "card" | "page";

function saleModeLabel(mode: WizardCoreValues["saleMode"]) {
  if (mode === "auction") return "Аукцион";
  if (mode === "free") return "Бесплатно";
  return "Продажа";
}

function confidenceLabel(confidence: number): { text: string; toneClass: string; noticeType: "success" | "warning" } {
  if (confidence >= 0.78) {
    return { text: "Высокая уверенность", toneClass: "bg-emerald-100 text-emerald-800", noticeType: "success" };
  }
  return { text: "Нужна проверка", toneClass: "bg-amber-100 text-amber-900", noticeType: "warning" };
}

function readyChecklist(values: WizardCoreValues, images: LocalPhoto[]) {
  const hasReadyPhotos = images.some((entry) => !entry.loading && entry.dataUrl);
  const hasContacts = values.useProfileContacts || (values.sellerName.trim() && values.phone.trim());
  return [
    { id: "photos", label: "Фото добавлены", ok: hasReadyPhotos },
    { id: "title", label: "Заголовок заполнен", ok: values.title.trim().length >= 3 },
    { id: "price", label: "Цена указана", ok: values.saleMode === "free" || Number.parseFloat(values.price.replace(",", ".")) > 0 },
    { id: "category", label: "Категория выбрана", ok: values.category.trim().length > 0 },
    { id: "contacts", label: "Контакты указаны", ok: Boolean(hasContacts) },
  ];
}

type CreateListingWizardProps = {
  initialWorld?: CatalogWorld;
  initialIsAuthenticated?: boolean;
};

export function CreateListingWizard({
  initialWorld = "all",
  initialIsAuthenticated = true,
}: CreateListingWizardProps) {
  const router = useRouter();
  const buyer = useBuyer();
  const profile = useProfile();
  const { role } = useDemoRole();
  const subscription = useSubscription();
  const putPublished = usePublishedListingStore((s) => s.putListing);
  const draftStore = useListingDraftStore();
  const aiFeature = useFeatureGate("ai_listing_assistant");
  const auctionGate = useFeatureGate("auction_create");
  const promoteGate = useFeatureGate("listing_promote");

  const formDefaults = getListingDraftDefaults({
    world: initialWorld === "all" ? "electronics" : initialWorld,
    isAuthenticated: initialIsAuthenticated,
    useProfileContacts: initialIsAuthenticated,
  });
  const form = useForm<WizardCoreValues>({ defaultValues: formDefaults, mode: "onChange" });
  const { register, handleSubmit, setValue, reset, formState, control, getValues, setError } = form;
  const values = useWatch({ control, defaultValue: formDefaults }) as WizardCoreValues;
  const hydrated = useRef(false);

  const [step, setStep] = useState(0);
  const [sessionNow] = useState(() => Date.now());
  const [images, setImages] = useState<LocalPhoto[]>([]);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snapPhotos, setSnapPhotos] = useState<LocalPhoto[]>([]);
  const [isSnapLoading, setIsSnapLoading] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<string[] | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("card");
  const [lastSnapResult, setLastSnapResult] = useState<SnapAndFillResult | null>(null);
  const [clarificationResolved, setClarificationResolved] = useState(false);
  const [showAiSummaryDetails, setShowAiSummaryDetails] = useState(false);
  const [auctionUpsellMessage, setAuctionUpsellMessage] = useState<string | null>(null);
  const [catalogListings, setCatalogListings] = useState<UnifiedCatalogListing[]>([]);
  const dynamicStepLabels = useMemo(
    () =>
      values.saleMode === "auction"
        ? [
            "Фото и ИИ",
            "Категория и мир",
            "Описание и цена",
            "Настройки аукциона",
            "Фото",
            "Локация и контакты",
            "Предпросмотр",
          ]
        : [...STEP_LABELS],
    [values.saleMode],
  );

  const auctionStartAtDate = useMemo(() => {
    if (values.auctionStartNow) {
      return new Date();
    }
    const parsed = Date.parse(values.auctionStartAt);
    return Number.isFinite(parsed) ? new Date(parsed) : new Date(sessionNow + 15 * 60_000);
  }, [values.auctionStartAt, values.auctionStartNow, sessionNow]);

  const auctionEndAtDate = useMemo(
    () => new Date(auctionStartAtDate.getTime() + values.auctionDurationHours * 60 * 60 * 1000),
    [auctionStartAtDate, values.auctionDurationHours],
  );

  const previewAuction = useMemo(
    () => ({
      id: "auction-preview",
      listingId: "wizard-preview",
      status: auctionStartAtDate.getTime() > sessionNow ? ("scheduled" as const) : ("live" as const),
      startPrice: Number.parseFloat(values.auctionStartPrice.replace(",", ".")) || Number.parseFloat(values.price.replace(",", ".")) || 0,
      reservePrice: values.auctionReservePrice.trim()
        ? Number.parseFloat(values.auctionReservePrice.replace(",", "."))
        : undefined,
      currentBid: Number.parseFloat(values.auctionStartPrice.replace(",", ".")) || Number.parseFloat(values.price.replace(",", ".")) || 0,
      bidCount: 0,
      startAt: auctionStartAtDate,
      endAt: auctionEndAtDate,
      bids: [],
      antiSnipingExtension: values.auctionAntiSnipingEnabled ? 5 : 0,
      minBidIncrement: values.auctionMinBidIncrement.trim()
        ? Number.parseFloat(values.auctionMinBidIncrement.replace(",", "."))
        : undefined,
    }),
    [auctionStartAtDate, auctionEndAtDate, values, sessionNow],
  );


  const profileContacts = useMemo(
    () => ({ sellerName: profile.name, phone: profile.phone }),
    [profile.name, profile.phone],
  );
  useEffect(() => {
    let cancelled = false;
    void mockListingsService.getAll().then((listings) => {
      if (!cancelled) {
        setCatalogListings(listings);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const locations = useMemo(() => getUniqueLocationsForUnified(catalogListings), [catalogListings]);
  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(values.world), [values.world]);
  const subCategoryOptions = useMemo(
    () => getSubcategoryOptionsForWorld(values.world, values.category),
    [values.world, values.category],
  );
  const worldPresentation = useMemo(() => getWorldPresentation(values.world), [values.world]);
  const worldHeroIcon = catalogWorldLucideIcons[values.world];
  const aiSuggestions = useMemo(
    () => getAiListingSuggestions({ title: values.title, category: values.category, price: values.price }),
    [values.category, values.price, values.title],
  );
  const priceRecommendation = useMemo(
    () => getPriceRecommendationMock({ category: values.category, title: values.title, price: values.price }),
    [values.category, values.price, values.title],
  );

  const previewListing = useMemo<UnifiedCatalogListing>(() => {
    const categoryLabel = categoryOptions.find((entry) => entry.id === values.category)?.label ?? "Категория";
    return {
      id: "wizard-preview",
      listingSaleMode: values.saleMode,
      title: values.title || "Заголовок объявления",
      price: formatWizardPrice(values),
      priceValue:
        values.saleMode === "auction"
          ? Number.parseFloat(values.auctionStartPrice.replace(",", ".")) || 0
          : Number.parseFloat(values.price.replace(",", ".")) || 0,
      location: values.city || "Город",
      publishedAt: "Черновик",
      postedAtIso: new Date().toISOString(),
      image: listingImageClass(),
      condition: conditionLabel(values.condition),
      description: values.description || "Описание появится после заполнения формы.",
      sellerName: "Вы",
      sellerPhone: "+7",
      categoryId: values.category || "services",
      categoryLabel,
      world: values.world === "all" ? "base" : values.world,
      worldLabel: getWorldLabel(values.world),
      detailsHref: undefined,
    };
  }, [categoryOptions, values]);

  const checklist = useMemo(() => readyChecklist(values, images), [images, values]);
  const sellerModeLabel = values.isAuthenticated ? "Профильный режим" : "Гостевой режим";

  useEffect(() => {
    if (!auctionGate.allowed && values.saleMode === "auction") {
      setValue("saleMode", "fixed");
    }
  }, [auctionGate.allowed, setValue, values.saleMode]);

  useEffect(() => {
    if (hydrated.current) return;
    const applyDraft = () => {
      if (hydrated.current) return;
      hydrated.current = true;
      const draft = useListingDraftStore.getState().draft;
      if (!draft) return;
      reset({
        world: draft.world,
        category: draft.category,
        subCategory: draft.subCategory,
        saleMode: draft.saleMode,
        title: draft.title,
        description: draft.description,
        price: draft.price,
        condition: draft.condition,
        city: draft.city,
        contactMethod: draft.contactMethod,
        availability: draft.availability,
        sellerName: draft.sellerName,
        phone: draft.phone,
        useProfileContacts: draft.useProfileContacts,
        isAuthenticated: draft.isAuthenticated,
        wantPromotion: draft.wantPromotion,
        promotePeriod: draft.promotePeriod,
        promoteScope: draft.promoteScope,
        auctionStartPrice: draft.auctionStartPrice,
        auctionReservePrice: draft.auctionReservePrice,
        auctionStartNow: draft.auctionStartNow,
        auctionStartAt: draft.auctionStartAt,
        auctionDurationHours: draft.auctionDurationHours,
        auctionAntiSnipingEnabled: draft.auctionAntiSnipingEnabled,
        auctionMinBidIncrement: draft.auctionMinBidIncrement,
      });
      const stepCap = draft.saleMode === "auction" ? 6 : 5;
      setStep(Math.max(0, Math.min(draft.step, stepCap)));
      setImages(draft.photos.map((p: DraftPhoto) => ({ ...p, loading: false })));
      setCoverPhotoId(draft.coverPhotoId);
    };
    if (useListingDraftStore.persist.hasHydrated()) {
      applyDraft();
      return;
    }
    return useListingDraftStore.persist.onFinishHydration(applyDraft);
  }, [reset]);

  const persistDraft = () => {
    const current = getValues();
    draftStore.replaceDraft({
      version: 1,
      step,
      world: current.world,
      category: current.category,
      subCategory: current.subCategory ?? "",
      saleMode: current.saleMode,
      title: current.title,
      description: current.description,
      price: current.price,
      condition: current.condition,
      city: current.city,
      contactMethod: current.contactMethod,
      availability: current.availability,
      sellerName: current.sellerName,
      phone: current.phone,
      useProfileContacts: current.useProfileContacts,
      isAuthenticated: current.isAuthenticated,
      coverPhotoId,
      photos: images.map((image) => ({ id: image.id, dataUrl: image.dataUrl, name: image.name })),
      wantPromotion: current.wantPromotion,
      promotePeriod: current.promotePeriod,
      promoteScope: current.promoteScope,
      auctionStartPrice: current.auctionStartPrice,
      auctionReservePrice: current.auctionReservePrice,
      auctionStartNow: current.auctionStartNow,
      auctionStartAt: current.auctionStartAt,
      auctionDurationHours: current.auctionDurationHours,
      auctionAntiSnipingEnabled: current.auctionAntiSnipingEnabled,
      auctionMinBidIncrement: current.auctionMinBidIncrement,
    });
    draftStore.touchSaved();
  };

  const addPhotos = (files: File[], limit: number, setter: Dispatch<SetStateAction<LocalPhoto[]>>) => {
    const selected = files.filter((file) => file.type.startsWith("image/"));
    setter((current) => {
      const room = Math.max(0, limit - current.length);
      const slice = selected.slice(0, room);
      const placeholders = slice.map((file) => ({ id: makePhotoId(), name: file.name, dataUrl: "", loading: true }));
      const merged = [...current, ...placeholders];
      slice.forEach((file, index) => {
        const id = placeholders[index].id;
        void (async () => {
          await new Promise((resolve) => setTimeout(resolve, 350));
          const data = await fileToDataUrl(file);
          setter((inner) => inner.map((img) => (img.id === id ? { ...img, dataUrl: data, loading: false } : img)));
        })();
      });
      return merged;
    });
  };

  const onSnapAndFill = async () => {
    if (!aiFeature.allowed) return;
    if (snapPhotos.filter((item) => !item.loading).length === 0) return;
    setIsSnapLoading(true);
    const assistant = createMockAIListingAssistant();
    const response = await assistant.snapAndFillFromPhotos({ photos: snapPhotos.map((photo) => photo.name) });
    setIsSnapLoading(false);
    if (response.needsClarification) {
      setClarificationQuestions(response.clarificationQuestions ?? []);
      setLastSnapResult(response);
      setClarificationResolved(false);
      return;
    }
    setValue("world", response.world as CatalogWorld);
    setValue("category", response.category);
    setValue("title", response.title);
    setValue("description", response.description);
    setValue("condition", response.condition);
    setValue("price", String(response.price.recommended), { shouldValidate: true });
    setLastSnapResult(response);
    setClarificationResolved(false);
    setStep(1);
  };

  const onSubmitClarifications = () => {
    if (!clarificationQuestions) return;
    const answers = clarificationQuestions.map((q) => clarificationAnswers[q] ?? "");
    const response = buildListingFromClarifications(answers);
    setValue("world", response.world as CatalogWorld);
    setValue("category", response.category);
    setValue("title", response.title);
    setValue("description", response.description);
    setValue("condition", response.condition);
    setValue("price", String(response.price.recommended), { shouldValidate: true });
    setLastSnapResult(response);
    setClarificationQuestions(null);
    setClarificationAnswers({});
    setClarificationResolved(true);
    setStep(1);
  };

  const validateStep = (index: number): boolean => {
    if (index === 1) {
      const parsed = step1Schema.safeParse(values);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof WizardCoreValues | undefined;
          if (path) setError(path, { message: issue.message });
        });
        return false;
      }
    }
    if (index === 2) {
      const parsed = buildStep2Schema(values.saleMode).safeParse(values);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof WizardCoreValues | undefined;
          if (path) setError(path, { message: issue.message });
        });
        return false;
      }
    }
    const auctionStepIndex = values.saleMode === "auction" ? 3 : -1;
    const photoStepIndex = values.saleMode === "auction" ? 4 : 3;
    const contactsStepIndex = values.saleMode === "auction" ? 5 : 4;

    if (index === auctionStepIndex) {
      const parsed = buildAuctionSettingsSchema(values.saleMode).safeParse(values);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof WizardCoreValues | undefined;
          if (path) setError(path, { message: issue.message });
        });
        return false;
      }
    }
    if (index === photoStepIndex && images.filter((entry) => !entry.loading && entry.dataUrl).length === 0) {
      setPhotoError("Добавьте хотя бы одно фото");
      return false;
    }
    if (index === contactsStepIndex) {
      const parsed = buildStep4Schema({
        skipManualContacts: values.isAuthenticated && values.useProfileContacts,
      }).safeParse(values);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof WizardCoreValues | undefined;
          if (path) setError(path, { message: issue.message });
        });
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, dynamicStepLabels.length - 1));
  };
  const goBack = () => setStep((current) => Math.max(current - 1, 0));
  const goManualFromSnap = () => setStep(1);

  const onPublish = handleSubmit(async (data: WizardCoreValues) => {
    if (images.filter((entry) => !entry.loading && entry.dataUrl).length === 0) {
      setPhotoError("Добавьте хотя бы одно фото");
      setStep(values.saleMode === "auction" ? 4 : 3);
      return;
    }
    const valid = fullPublishSchema.safeParse(data);
    if (!valid.success) {
      setSubmitError("Проверьте поля формы перед публикацией");
      return;
    }
    setIsPublishing(true);
    const sellerName = data.isAuthenticated && data.useProfileContacts ? profileContacts.sellerName : data.sellerName;
    const sellerPhone = data.isAuthenticated && data.useProfileContacts ? profileContacts.phone : data.phone;
    const createdCatalogListing = await mockListingsService.create({
      listingSaleMode: data.saleMode,
      title: data.title.trim(),
      price: formatWizardPrice(data),
      priceValue:
        data.saleMode === "auction"
          ? Number.parseFloat(data.auctionStartPrice.replace(",", ".")) || 0
          : Number.parseFloat(data.price.replace(",", ".")) || 0,
      categoryId: data.category,
      categoryLabel: categoryOptions.find((entry) => entry.id === data.category)?.label ?? data.category,
      location: data.city.trim(),
      image: listingImageClass(),
      condition: conditionLabel(data.condition),
      description: data.description.trim(),
      sellerName,
      sellerPhone,
      world: data.world === "all" ? "base" : data.world,
      worldLabel: getWorldLabel(data.world),
    });
    const listingId = createdCatalogListing.id;
    buyer.addListing({
      id: listingId,
      title: data.title.trim(),
      price: formatWizardPrice(data),
      category: data.category,
      city: data.city.trim(),
      image: listingImageClass(),
      status: "active",
    });
    putPublished(listingId, buildListingForStore(listingId, data, sellerName, sellerPhone));
    if (data.saleMode === "auction") {
      if (!auctionGate.allowed) {
        throw new Error("Feature auction_create is not available");
      }
      const auctionStartAt = data.auctionStartNow ? new Date() : new Date(data.auctionStartAt);
      await mockAuctionService.createAuction({
        listingId,
        creator: {
          role,
          subscription: {
            isPro: subscription.isPro,
            planName: subscription.planName,
            storePlan: subscription.storePlan,
          },
        },
        startPrice:
          Number.parseFloat(data.auctionStartPrice.replace(",", ".")) ||
          Number.parseFloat(data.price.replace(",", ".")) ||
          1,
        reservePrice: data.auctionReservePrice.trim()
          ? Number.parseFloat(data.auctionReservePrice.replace(",", "."))
          : undefined,
        startAt: auctionStartAt,
        endAt: new Date(auctionStartAt.getTime() + data.auctionDurationHours * 60 * 60 * 1000),
        antiSnipingExtension: data.auctionAntiSnipingEnabled ? 5 : 0,
        minBidIncrement: data.auctionMinBidIncrement.trim()
          ? Number.parseFloat(data.auctionMinBidIncrement.replace(",", "."))
          : undefined,
      });
    }
    if (promoteGate.allowed && data.wantPromotion) {
      const worldId: HeroBannerWorld | undefined =
        data.promoteScope === "world"
          ? data.world === "all"
            ? "electronics"
            : (data.world as HeroBannerWorld)
          : undefined;
      buyer.promoteListing({
        listingId,
        listingTitle: data.title,
        scope: data.promoteScope as HeroBannerScope,
        period: data.promotePeriod as HeroBannerPeriod,
        worldId,
        mockPrice: 12000,
      });
    }
    useListingDraftStore.getState().clearDraft();
    setIsPublishing(false);
    router.push(`/listings/${listingId}?posted=1`);
  });

  const progressTotal = dynamicStepLabels.length;

  const renderCatalogCardPreview = () => (
    <div className="space-y-2">
      {values.saleMode === "auction" ? (
        <AuctionCard listing={previewListing} auction={previewAuction} view="grid" />
      ) : (
        <ListingPreviewCard listing={previewListing} view="grid" />
      )}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
          {getWorldLabel(values.world)}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
          {categoryOptions.find((entry) => entry.id === values.category)?.label ?? "Категория"}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
          {saleModeLabel(values.saleMode)}
        </span>
      </div>
      {values.saleMode === "auction" ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
          <p className="font-semibold">Аукцион (черновик)</p>
          <p>
            Начнётся: {auctionStartAtDate.toLocaleString("ru-RU")} · Продлится: {values.auctionDurationHours} ч
          </p>
          <p>Минимальная следующая ставка: {getMinimumNextBid(previewAuction).toLocaleString("ru-RU")} ₽</p>
        </div>
      ) : null}
    </div>
  );

  const renderCompactPreviewWidget = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</p>
      <div className="mt-2 space-y-2">
        <p className="line-clamp-2 text-sm font-semibold text-slate-900">{values.title || "Заголовок объявления"}</p>
        <p className="text-lg font-bold text-slate-900">{formatWizardPrice(values)}</p>
        <p className="text-xs text-slate-600">{values.city || "Город не указан"}</p>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
            {getWorldLabel(values.world)}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
            {categoryOptions.find((entry) => entry.id === values.category)?.label ?? "Категория"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
            {saleModeLabel(values.saleMode)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPagePreview = () => (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-48 w-full bg-gradient-to-br ${listingImageClass()}`} />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-semibold text-slate-900">{values.title || "Заголовок объявления"}</h4>
          {values.wantPromotion ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
              Продвигается
            </span>
          ) : null}
        </div>
        <p className="text-2xl font-bold text-slate-900">{formatWizardPrice(values)}</p>
        <p className="text-sm text-slate-700">{values.description || "Описание появится после заполнения."}</p>
        <div className="grid gap-1.5 text-xs text-slate-600 sm:grid-cols-2">
          <p>Состояние: {conditionLabel(values.condition)}</p>
          <p>Город: {values.city || "Не указан"}</p>
          <p>Связь: {contactMethods.find((entry) => entry.id === values.contactMethod)?.label ?? "Не указано"}</p>
          <p>Режим: {sellerModeLabel}</p>
        </div>
      </div>
    </article>
  );

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <SectionCard padding="sm" className="border-slate-200/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Шаг {step + 1} из {progressTotal}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={persistDraft}>
            Сохранить черновик
          </Button>
        </div>
        <div className="mt-3 flex gap-1.5">
          {dynamicStepLabels.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-slate-900" : "bg-slate-200")} />
              <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">{label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard padding="lg">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
          <div className="space-y-5">
            {step === 0 ? (
              <section className="space-y-4">
                <header className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">Шаг 1. Фото и ИИ</h3>
                  <p className="text-sm text-slate-600">
                    Заполните объявление по фото или начните с ручного ввода.
                  </p>
                </header>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <p className="font-medium">Заполнить объявление по фото</p>
                  <p className="mt-1 text-xs text-slate-600">
                    ИИ подберёт категорию, заголовок, описание и цену за несколько секунд.
                  </p>
                </div>
                <div
                  className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e: DragEvent) => {
                    e.preventDefault();
                    addPhotos(Array.from(e.dataTransfer.files ?? []), 3, setSnapPhotos);
                  }}
                >
                  <ImagePlus className="mx-auto h-9 w-9 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">Перетащите 1-3 фотографии</p>
                  <label className={cn(buttonVariants({ variant: "outline", className: "mt-3 cursor-pointer" }))}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addPhotos(Array.from(e.target.files ?? []), 3, setSnapPhotos)}
                    />
                    Выбрать фото
                  </label>
                </div>
                {snapPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {snapPhotos.map((photo) => (
                      <div key={photo.id} className="overflow-hidden rounded-xl border border-slate-200">
                        {photo.loading ? (
                          <div className="h-24 animate-pulse bg-slate-200" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo.dataUrl} alt={photo.name} className="h-24 w-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="space-y-2">
                  {aiFeature.allowed ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void onSnapAndFill()} disabled={isSnapLoading}>
                        {isSnapLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ИИ анализирует фото...
                          </>
                        ) : (
                          "Заполнить объявление по фото"
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={goManualFromSnap}>
                        Заполнить вручную
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                      <UpgradeBanner feature="ai_listing_assistant" compact />
                      <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-900">
                        <li>Экономит время</li>
                        <li>Помогает выбрать категорию</li>
                        <li>Предлагает цену</li>
                        <li>Заполняет черновик автоматически</li>
                      </ul>
                      <Button type="button" variant="outline" onClick={goManualFromSnap}>
                        Заполнить вручную
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">Доступно в тарифах Pro / платных магазинах.</p>
                </div>
                {lastSnapResult && !lastSnapResult.needsClarification ? (
                  <InlineNotice
                    type={confidenceLabel(lastSnapResult.confidence).noticeType}
                    title="ИИ заполнил черновик"
                    description={`Заполнено 6 полей: категория, заголовок, описание, состояние, цена, теги. ${confidenceLabel(lastSnapResult.confidence).text}.`}
                  />
                ) : null}
                {clarificationResolved ? (
                  <InlineNotice
                    type="success"
                    title="Черновик обновлён на основе ваших уточнений"
                    description="Проверьте предложенные данные перед публикацией."
                  />
                ) : null}
              </section>
            ) : null}

            {step === 1 ? (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Шаг 2. Категория и мир</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {worldCardIds.map((worldId) => {
                    const item = getWorldPresentation(worldId);
                    const Icon = catalogWorldLucideIcons[worldId];
                    return (
                      <button
                        key={worldId}
                        type="button"
                        onClick={() => {
                          setValue("world", worldId);
                          setValue("category", "");
                          setValue("subCategory", "");
                        }}
                        className={cn(
                          "relative overflow-hidden rounded-xl border p-3 text-left",
                          item.homeCardToneClass,
                          values.world === worldId && "ring-2 ring-slate-900",
                        )}
                      >
                        <div className={`pointer-events-none absolute inset-0 ${item.heroDecorClass}`} />
                        <div className="relative flex items-center gap-2">
                          {createElement(Icon, { className: "h-4 w-4", strokeWidth: 1.5 })}
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FormField label="Категория" htmlFor="category" required error={formState.errors.category?.message}>
                  <Select id="category" {...register("category")} hasError={Boolean(formState.errors.category)}>
                    <option value="">Выберите категорию</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                {subCategoryOptions.length > 0 ? (
                  <FormField label="Подкатегория" htmlFor="subCategory">
                    <Select id="subCategory" {...register("subCategory")}>
                      <option value="">Не выбрано</option>
                      {subCategoryOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["fixed", "auction", "free"] as const).map((mode) => (
                    <label
                      key={mode}
                      onClick={() => {
                        if (mode === "auction" && !auctionGate.allowed) {
                          setAuctionUpsellMessage(
                            "Частные пользователи: Pro/Business. Магазины: Store Pro/Business.",
                          );
                        } else {
                          setAuctionUpsellMessage(null);
                        }
                      }}
                      className={cn(
                        "cursor-pointer rounded-xl border px-3 py-2 text-sm",
                        values.saleMode === mode ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200",
                        mode === "auction" && !auctionGate.allowed && "opacity-60",
                      )}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={mode}
                        disabled={mode === "auction" && !auctionGate.allowed}
                        {...register("saleMode")}
                      />
                      {mode === "fixed" ? "Фиксированная цена" : mode === "auction" ? "Аукцион" : "Бесплатно"}
                    </label>
                  ))}
                </div>
                {!auctionGate.allowed ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-medium">Доступ к аукционам зависит от роли и тарифа.</p>
                    <p className="mt-1 text-xs">Частные пользователи: Pro и выше. Магазины: Store Pro и выше.</p>
                  </div>
                ) : null}
                {auctionUpsellMessage ? <p className="text-xs text-amber-700">{auctionUpsellMessage}</p> : null}
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Шаг 3. Описание и цена</h3>
                <FormField label="Заголовок" htmlFor="title" required error={formState.errors.title?.message}>
                  <Input id="title" {...register("title")} hasError={Boolean(formState.errors.title)} />
                </FormField>
                {aiFeature.allowed ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    <p className="font-medium">AI-подсказка: {aiSuggestions.titleSuggestion}</p>
                    <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => setValue("title", aiSuggestions.titleSuggestion)}>
                      Подставить
                    </Button>
                  </div>
                ) : null}
                <FormField label="Описание" htmlFor="description" required error={formState.errors.description?.message}>
                  <Textarea id="description" rows={6} {...register("description")} hasError={Boolean(formState.errors.description)} />
                </FormField>
                <FormField label="Цена, ₽" htmlFor="price" required error={formState.errors.price?.message}>
                  <Input
                    id="price"
                    inputMode="decimal"
                    placeholder={values.saleMode === "auction" ? "Для аукциона цена берётся из стартовой ставки" : "Например, 120000"}
                    {...register("price")}
                    disabled={values.saleMode === "auction"}
                    hasError={Boolean(formState.errors.price)}
                  />
                </FormField>
                {values.saleMode === "auction" ? (
                  <p className="text-xs text-slate-500">
                    Для аукциона каноническая цена объявления — стартовая цена на шаге «Настройки аукциона».
                  </p>
                ) : null}
                {values.saleMode !== "free" && values.price.trim() ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm">
                    <p className="font-medium">
                      Рекомендация: {priceRecommendation.suggestedMin.toLocaleString("ru-RU")} - {priceRecommendation.suggestedMax.toLocaleString("ru-RU")} ₽
                    </p>
                    <p className="mt-1 text-xs text-indigo-900">{priceRecommendation.rationale}</p>
                  </div>
                ) : null}
                <FormField label="Состояние товара" htmlFor="condition">
                  <Select id="condition" {...register("condition")}>
                    {CONDITION_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </section>
            ) : null}

            {step === 3 && values.saleMode === "auction" ? (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Шаг 4. Настройки аукциона</h3>
                <FormField label="Стартовая цена" htmlFor="auctionStartPrice" required error={formState.errors.auctionStartPrice?.message}>
                  <Input id="auctionStartPrice" inputMode="decimal" placeholder="Например, 50000" {...register("auctionStartPrice")} />
                </FormField>
                <FormField
                  label="Резервная цена (опционально)"
                  htmlFor="auctionReservePrice"
                  error={formState.errors.auctionReservePrice?.message}
                  hint="Если резервная цена не достигнута, аукцион может завершиться без продажи."
                >
                  <Input id="auctionReservePrice" inputMode="decimal" placeholder="Например, 65000" {...register("auctionReservePrice")} />
                </FormField>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={values.auctionStartNow} onChange={(e) => setValue("auctionStartNow", e.target.checked)} />
                  Начать сразу после публикации
                </label>
                {!values.auctionStartNow ? (
                  <FormField label="Дата и время начала" htmlFor="auctionStartAt" required error={formState.errors.auctionStartAt?.message}>
                    <Input id="auctionStartAt" type="datetime-local" {...register("auctionStartAt")} />
                  </FormField>
                ) : null}
                <FormField label="Длительность" htmlFor="auctionDurationHours">
                  <Select id="auctionDurationHours" {...register("auctionDurationHours", { valueAsNumber: true })}>
                    <option value={12}>12 часов</option>
                    <option value={24}>24 часа</option>
                    <option value={72}>3 дня</option>
                    <option value={168}>7 дней</option>
                  </Select>
                </FormField>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Расчётное завершение: {auctionEndAtDate.toLocaleString("ru-RU")}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.auctionAntiSnipingEnabled}
                    onChange={(e) => setValue("auctionAntiSnipingEnabled", e.target.checked)}
                  />
                  Продлевать на 5 минут при ставке в последние 2 минуты
                </label>
                <FormField label="Минимальный шаг ставки (опционально)" htmlFor="auctionMinBidIncrement" error={formState.errors.auctionMinBidIncrement?.message}>
                  <Input id="auctionMinBidIncrement" inputMode="decimal" placeholder="Авто по правилам, если пусто" {...register("auctionMinBidIncrement")} />
                </FormField>
                <details className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <summary className="cursor-pointer font-medium">Как будет работать аукцион</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
                    <li>Ставки принимаются только кратно шагу.</li>
                    <li>Побеждает максимальная ставка (proxy-механика).</li>
                    <li>Если резерв не достигнут, продажа может не состояться.</li>
                    <li>Anti-sniping продлевает аукцион при ставке в последние минуты.</li>
                  </ul>
                </details>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
                  Кто может делать ставки: пользователи с подтверждённым профилем и доступом к аукционам.
                  Автоставка доступна в тарифе Pro+.
                </div>
              </section>
            ) : null}

            {step === (values.saleMode === "auction" ? 4 : 3) ? (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Шаг {values.saleMode === "auction" ? 5 : 4}. Фото
                </h3>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addPhotos(Array.from(e.dataTransfer.files ?? []), 10, setImages); }}>
                  <ImagePlus className="mx-auto h-9 w-9 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-700">Drag & drop или выберите до 10 фото</p>
                  <label className={cn(buttonVariants({ variant: "outline", className: "mt-3 cursor-pointer" }))}>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(Array.from(e.target.files ?? []), 10, setImages)} />
                    Выбрать фото
                  </label>
                </div>
                {photoError ? <p className="text-sm text-rose-600">{photoError}</p> : null}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => setDragId(image.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (!dragId || dragId === image.id) return;
                        setImages((current) => {
                          const from = current.findIndex((item) => item.id === dragId);
                          const to = current.findIndex((item) => item.id === image.id);
                          if (from < 0 || to < 0) return current;
                          const next = [...current];
                          const [moved] = next.splice(from, 1);
                          next.splice(to, 0, moved);
                          return next;
                        });
                        setDragId(null);
                      }}
                      className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                        {image.loading ? (
                          <div className="h-full w-full animate-pulse bg-slate-200" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" />
                        )}
                      <button type="button" className="absolute left-1 top-1 rounded bg-black/60 p-1 text-white"><GripVertical className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setCoverPhotoId(image.id)} className={cn("absolute bottom-1 right-1 rounded p-1", (coverPhotoId ?? images[0]?.id) === image.id ? "bg-amber-400 text-slate-900" : "bg-black/60 text-white")}>
                        <Star className="h-4 w-4" fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {step === (values.saleMode === "auction" ? 5 : 4) ? (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Шаг {values.saleMode === "auction" ? 6 : 5}. Локация и контакты
                </h3>
                <FormField label="Город" htmlFor="city" required error={formState.errors.city?.message}>
                  <Select id="city" {...register("city")} hasError={Boolean(formState.errors.city)}>
                    <option value="">Выберите город</option>
                    {locations.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Способ связи" htmlFor="contactMethod" required error={formState.errors.contactMethod?.message}>
                  <Select id="contactMethod" {...register("contactMethod")} hasError={Boolean(formState.errors.contactMethod)}>
                    <option value="">Выберите способ связи</option>
                    {contactMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Время доступности" htmlFor="availability">
                  <Select id="availability" {...register("availability")}>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={values.useProfileContacts} onChange={(e) => setValue("useProfileContacts", e.target.checked)} />
                  Использовать контакты из профиля
                </label>
                {values.useProfileContacts ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    {profileContacts.sellerName} · {profileContacts.phone}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField label="Имя" htmlFor="sellerName" required error={formState.errors.sellerName?.message}>
                      <Input id="sellerName" {...register("sellerName")} />
                    </FormField>
                    <FormField label="Телефон" htmlFor="phone" required error={formState.errors.phone?.message}>
                      <Input id="phone" {...register("phone")} />
                    </FormField>
                  </div>
                )}
              </section>
            ) : null}

            {step === dynamicStepLabels.length - 1 ? (
              <section className="space-y-4">
                <header className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Шаг {dynamicStepLabels.length}. Предпросмотр перед публикацией
                  </h3>
                  <p className="text-sm text-slate-600">
                    Так объявление увидят покупатели в каталоге и на странице товара.
                  </p>
                </header>
                <div className="hidden items-center gap-2 md:flex">
                  <Button
                    type="button"
                    variant={previewMode === "card" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("card")}
                  >
                    Карточка
                  </Button>
                  <Button
                    type="button"
                    variant={previewMode === "page" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("page")}
                  >
                    Страница объявления
                  </Button>
                </div>
                <div className="md:hidden">{renderCatalogCardPreview()}</div>
                <div className="md:hidden">{renderPagePreview()}</div>
                <div className="hidden md:block">{previewMode === "card" ? renderCatalogCardPreview() : renderPagePreview()}</div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">Проверка готовности</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {checklist.map((item) => (
                      <li key={item.id} className={cn("flex items-center gap-2", item.ok ? "text-emerald-700" : "text-amber-800")}>
                        <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full", item.ok ? "bg-emerald-100" : "bg-amber-100")}>
                          {item.ok ? "✓" : "!"}
                        </span>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-slate-500">Покупатели увидят объявление именно так. Проверьте данные перед публикацией.</p>
                {promoteGate.allowed ? (
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" {...register("wantPromotion")} className="mt-1" />
                    Продвинуть объявление после публикации
                  </label>
                ) : null}
                {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
                <Button type="button" variant="primary" className="hidden w-full md:inline-flex" disabled={isPublishing} onClick={() => void onPublish()}>
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Опубликовать"}
                </Button>
              </section>
            ) : null}

            {step >= 1 && step <= (values.saleMode === "auction" ? 5 : 4) ? (
              <div className="lg:hidden">
                {renderCompactPreviewWidget()}
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              {step === 0 ? (
                <>
                  <SectionCard
                    padding="sm"
                    title="Преимущества AI"
                    subtitle="Premium-фича для быстрых публикаций"
                  >
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>Экономит время на заполнении</li>
                      <li>Подсказывает категорию и цену</li>
                      <li>Заполняет черновик автоматически</li>
                    </ul>
                  </SectionCard>
                  <SectionCard padding="sm" title="Что заполнит ИИ">
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {["Категория", "Заголовок", "Описание", "Цена", "Состояние", "Теги"].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                </>
              ) : null}

              {step >= 1 && step <= (values.saleMode === "auction" ? 5 : 4) ? (
                <>
                  {renderCompactPreviewWidget()}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                    • Добавьте хорошие фото • Укажите состояние • Проверьте цену перед публикацией
                  </div>
                  {lastSnapResult ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-slate-700">
                          ИИ заполнил: категорию, заголовок, цену
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAiSummaryDetails((current) => !current)}
                          className="font-semibold text-slate-700 underline underline-offset-2"
                        >
                          {showAiSummaryDetails ? "Скрыть" : "Подробнее"}
                        </button>
                      </div>
                      {showAiSummaryDetails ? (
                        <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2 text-slate-600">
                          {["Категория", "Заголовок", "Описание", "Цена", "Состояние", "Теги"].map((item) => (
                            <p key={item} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                              {item}
                            </p>
                          ))}
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                              confidenceLabel(lastSnapResult.confidence).toneClass,
                            )}
                          >
                            {confidenceLabel(lastSnapResult.confidence).text}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}

              {step === dynamicStepLabels.length - 1 ? (
                <>
                  <SectionCard padding="sm" title="Большой предпросмотр">
                    <div className="mb-2 flex gap-2">
                      <Button
                        type="button"
                        variant={previewMode === "card" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPreviewMode("card")}
                      >
                        Карточка
                      </Button>
                      <Button
                        type="button"
                        variant={previewMode === "page" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPreviewMode("page")}
                      >
                        Страница
                      </Button>
                    </div>
                    {previewMode === "card" ? renderCatalogCardPreview() : renderPagePreview()}
                  </SectionCard>
                  <SectionCard padding="sm" title="Готовность">
                    <ul className="space-y-1.5 text-sm">
                      {checklist.map((item) => (
                        <li key={item.id} className={item.ok ? "text-emerald-700" : "text-amber-800"}>
                          {item.ok ? "✓" : "!"} {item.label}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                </>
              ) : null}

              <SectionCard padding="sm" className={worldPresentation.heroToneClass}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {createElement(worldHeroIcon, { className: "h-4 w-4", strokeWidth: 1.5 })}
                  {getWorldLabel(values.world)}
                </div>
              </SectionCard>
              {step >= 1 && step <= 4 && aiFeature.allowed ? (
                <p className="px-1 text-[11px] text-slate-500">{aiSuggestions.priceTip}</p>
              ) : null}
            </div>
          </aside>
        </div>
      </SectionCard>

      {clarificationQuestions ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">ИИ не уверен, давайте уточним</h3>
            <p className="mt-1 text-sm text-slate-600">
              Ответьте на пару вопросов, и мы обновим черновик точнее.
            </p>
            <div className="mt-4 space-y-3">
              {clarificationQuestions.map((question) => (
                <label key={question} className="block text-sm">
                  <span className="mb-1 block text-slate-700">{question}</span>
                  <Textarea
                    rows={2}
                    value={clarificationAnswers[question] ?? ""}
                    onChange={(e) => setClarificationAnswers((prev) => ({ ...prev, [question]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setClarificationQuestions(null)}>
                Отмена
              </Button>
              <Button type="button" onClick={onSubmitClarifications}>
                Применить и продолжить
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Назад
          </Button>
          {step < dynamicStepLabels.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Далее
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={() => void onPublish()} disabled={isPublishing}>
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Опубликовать"}
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}

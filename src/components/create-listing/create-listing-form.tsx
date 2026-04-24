"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, createElement, FormEvent, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { FormField } from "@/components/create-listing/form-field";
import { ImageUploader } from "@/components/create-listing/image-uploader";
import { Input } from "@/components/create-listing/input";
import { Select } from "@/components/create-listing/select";
import { SubmitBar } from "@/components/create-listing/submit-bar";
import { Textarea } from "@/components/create-listing/textarea";
import {
  CreateListingFormData,
  FormErrors,
  ListingImage,
} from "@/components/create-listing/types";
import {
  CatalogWorld,
  getCategoryOptionsForWorld,
  getSubcategoryOptionsForWorld,
  getWorldLabel,
  worldOptions,
} from "@/lib/listings";
import { catalogWorldLucideIcons } from "@/config/icons";
import { defaultProfileFields } from "@/lib/profile-mock";
import { getWorldPresentation } from "@/lib/worlds";

const contactMethods = [
  { id: "phone", label: "Только звонки" },
  { id: "chat", label: "Только сообщения" },
  { id: "both", label: "Звонки и сообщения" },
] as const;

const defaultForm: CreateListingFormData = {
  world: "all",
  title: "",
  category: "",
  subCategory: "",
  price: "",
  city: "",
  description: "",
  sellerName: "",
  phone: "",
  contactMethod: "",
};

function validateForm(
  values: CreateListingFormData,
  imagesCount: number,
  options: { isAuthenticated: boolean; useProfileContacts: boolean },
): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) errors.title = "Укажите заголовок объявления";
  if (!values.category) errors.category = "Выберите категорию";
  if (!values.price.trim()) {
    errors.price = "Укажите цену";
  } else if (!/^\d+([.,]\d{1,2})?$/.test(values.price.trim())) {
    errors.price = "Введите цену в формате 1000 или 1000.50";
  }
  if (!values.city.trim()) errors.city = "Укажите город";
  if (!values.description.trim()) {
    errors.description = "Добавьте описание";
  } else if (values.description.trim().length < 20) {
    errors.description = "Описание должно быть не короче 20 символов";
  }
  const shouldValidateManualContacts = !options.isAuthenticated || !options.useProfileContacts;

  if (shouldValidateManualContacts && !values.sellerName.trim()) errors.sellerName = "Укажите имя продавца";
  if (shouldValidateManualContacts && !values.phone.trim()) {
    errors.phone = "Укажите номер телефона";
  } else if (shouldValidateManualContacts && !/^[+\d()\s-]{10,20}$/.test(values.phone.trim())) {
    errors.phone = "Введите корректный номер телефона";
  }
  if (!values.contactMethod) errors.contactMethod = "Выберите способ связи";
  if (imagesCount === 0) errors.images = "Добавьте хотя бы одно фото";

  return errors;
}

type CreateListingFormProps = {
  initialWorld?: CatalogWorld;
  initialIsAuthenticated?: boolean;
};

export function CreateListingForm({
  initialWorld = "all",
  initialIsAuthenticated = true,
}: CreateListingFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateListingFormData>({ ...defaultForm, world: initialWorld });
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [useProfileContacts, setUseProfileContacts] = useState(initialIsAuthenticated);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [touched, setTouched] = useState<Partial<Record<keyof CreateListingFormData, boolean>>>(
    {},
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const profileContacts = useMemo(
    () => ({
      sellerName: defaultProfileFields.name,
      phone: defaultProfileFields.phone,
    }),
    [],
  );

  const errors = useMemo(
    () => validateForm(formData, images.length, { isAuthenticated, useProfileContacts }),
    [formData, images.length, isAuthenticated, useProfileContacts],
  );
  const isValid = Object.keys(errors).length === 0;
  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(formData.world), [formData.world]);
  const subCategoryOptions = useMemo(
    () => getSubcategoryOptionsForWorld(formData.world, formData.category),
    [formData.world, formData.category],
  );
  const worldPresentation = useMemo(() => getWorldPresentation(formData.world), [formData.world]);
  const worldHeroIcon = catalogWorldLucideIcons[formData.world];

  function resetForm() {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setFormData({ ...defaultForm, world: initialWorld });
    setIsAuthenticated(initialIsAuthenticated);
    setUseProfileContacts(initialIsAuthenticated);
    setImages([]);
    setTouched({});
    setShowErrors(false);
    setIsSubmitted(false);
  }

  function handleUseProfileContactsChange(nextValue: boolean) {
    setUseProfileContacts(nextValue);
    if (!nextValue) {
      setFormData((current) => ({
        ...current,
        sellerName: current.sellerName || profileContacts.sellerName,
        phone: current.phone || profileContacts.phone,
      }));
    }
  }

  function handleFieldChange<K extends keyof CreateListingFormData>(
    field: K,
    value: CreateListingFormData[K],
  ) {
    setFormData((current) => {
      if (field === "world") {
        return {
          ...current,
          world: value as CatalogWorld,
          category: "",
          subCategory: "",
        };
      }

      if (field === "category") {
        return {
          ...current,
          category: value as string,
          subCategory: "",
        };
      }

      return { ...current, [field]: value };
    });
  }

  function handleFieldBlur(field: keyof CreateListingFormData) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleAddImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextImages = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...nextImages]);
    event.target.value = "";
  }

  function handleRemoveImage(id: string) {
    setImages((current) => {
      const imageToRemove = current.find((image) => image.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return current.filter((image) => image.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);

    if (!isValid) return;

    const sellerName =
      isAuthenticated && useProfileContacts ? profileContacts.sellerName : formData.sellerName;
    const sellerPhone = isAuthenticated && useProfileContacts ? profileContacts.phone : formData.phone;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setIsSubmitted(true);
    if (formData.world !== "all") {
      router.replace(`/create-listing?world=${formData.world}`);
    }

    void sellerName;
    void sellerPhone;
  }

  if (isSubmitted) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Объявление опубликовано
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-600 sm:text-base">
          Карточка добавлена в каталог и скоро появится в выдаче. Вы можете сразу перейти к
          объявлениям или разместить еще одно.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={formData.world === "all" ? "/listings" : `/listings?world=${formData.world}`}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
          >
            Перейти к объявлениям
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            Создать еще одно
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border shadow-sm ${formData.world === "all" ? "border-slate-200 bg-white" : worldPresentation.sectionToneClass}`}
    >
      <div className="space-y-8 p-4 sm:p-6">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Контекст размещения</p>
            <h2 className="text-lg font-semibold text-slate-900">В каком мире публикуете объявление?</h2>
            <p className="text-sm text-slate-600">
              Единый продукт, разные сценарии discovery: выбирайте контекст до заполнения карточки.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {worldOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleFieldChange("world", option.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  formData.world === option.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <p className="font-semibold">{option.label}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">Выбранный мир: {getWorldLabel(formData.world)}</p>
        </section>

        <section className={`relative overflow-hidden rounded-2xl border p-4 ${worldPresentation.heroToneClass}`}>
          <div className={`pointer-events-none absolute inset-0 ${worldPresentation.heroDecorClass}`} />
          <div className="relative space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Контекст публикации</p>
            <h3 className="text-lg font-semibold tracking-tight">
              <span className="mr-1 inline-flex shrink-0 align-middle" aria-hidden>
                {createElement(worldHeroIcon, { className: "h-5 w-5", strokeWidth: 1.5 })}
              </span>
              {worldPresentation.title}
            </h3>
            <p className="text-sm opacity-90">{worldPresentation.subtitle}</p>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Режим публикации</p>
              <p className="text-sm font-medium text-slate-800">
                {isAuthenticated ? "Авторизованный пользователь" : "Гостевой режим"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !isAuthenticated;
                setIsAuthenticated(next);
                setUseProfileContacts(next);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {isAuthenticated ? "Переключить в гостевой режим" : "Использовать профиль"}
            </button>
          </div>
          {!isAuthenticated ? (
            <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              Войдите в профиль, чтобы не вводить контакты каждый раз и автоматически использовать их в новых
              объявлениях. <Link href="/profile" className="font-semibold underline">Открыть профиль</Link>
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Основная информация</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                label="Заголовок объявления"
                htmlFor="title"
                required
                error={showErrors || touched.title ? errors.title : undefined}
              >
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                  onBlur={() => handleFieldBlur("title")}
                  placeholder="Например: iPhone 15 Pro 256GB"
                  hasError={Boolean((showErrors || touched.title) && errors.title)}
                />
              </FormField>
            </div>

            <FormField
              label="Категория"
              htmlFor="category"
              required
              error={showErrors || touched.category ? errors.category : undefined}
            >
              <Select
                id="category"
                value={formData.category}
                onChange={(event) => handleFieldChange("category", event.target.value)}
                onBlur={() => handleFieldBlur("category")}
                hasError={Boolean((showErrors || touched.category) && errors.category)}
              >
                <option value="">Выберите категорию</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {formData.world !== "all" ? (
              <FormField
                label="Подкатегория"
                htmlFor="subCategory"
                hint="Уточняет размещение внутри выбранного мира"
              >
                <Select
                  id="subCategory"
                  value={formData.subCategory}
                  onChange={(event) => handleFieldChange("subCategory", event.target.value)}
                >
                  <option value="">Выберите подкатегорию</option>
                  {subCategoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            ) : null}

            <FormField
              label="Город"
              htmlFor="city"
              required
              error={showErrors || touched.city ? errors.city : undefined}
            >
              <Input
                id="city"
                value={formData.city}
                onChange={(event) => handleFieldChange("city", event.target.value)}
                onBlur={() => handleFieldBlur("city")}
                placeholder="Москва"
                hasError={Boolean((showErrors || touched.city) && errors.city)}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Параметры объявления</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Цена"
              htmlFor="price"
              required
              hint="Только цифры, без пробелов (например 120000)"
              error={showErrors || touched.price ? errors.price : undefined}
            >
              <Input
                id="price"
                inputMode="decimal"
                value={formData.price}
                onChange={(event) => handleFieldChange("price", event.target.value)}
                onBlur={() => handleFieldBlur("price")}
                placeholder="120000"
                hasError={Boolean((showErrors || touched.price) && errors.price)}
              />
            </FormField>

            <div />

            <div className="sm:col-span-2">
              <FormField
                label="Описание"
                htmlFor="description"
                required
                hint="Расскажите о состоянии, комплектации, преимуществах"
                error={showErrors || touched.description ? errors.description : undefined}
              >
                <Textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(event) => handleFieldChange("description", event.target.value)}
                  onBlur={() => handleFieldBlur("description")}
                  placeholder="Подробно опишите товар или услугу..."
                  hasError={Boolean((showErrors || touched.description) && errors.description)}
                />
              </FormField>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Контакты продавца</h2>
          {isAuthenticated ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-sm text-slate-600">Контакты из профиля:</p>
              <div className="grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
                <p className="rounded-xl bg-white px-3 py-2">
                  <span className="block text-xs text-slate-500">Имя</span>
                  {profileContacts.sellerName}
                </p>
                <p className="rounded-xl bg-white px-3 py-2">
                  <span className="block text-xs text-slate-500">Телефон</span>
                  {profileContacts.phone}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={useProfileContacts}
                  onChange={(event) => handleUseProfileContactsChange(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Использовать эти контакты для объявления
              </label>
            </div>
          ) : null}

          {!isAuthenticated || !useProfileContacts ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Имя продавца"
                htmlFor="sellerName"
                required
                error={showErrors || touched.sellerName ? errors.sellerName : undefined}
              >
                <Input
                  id="sellerName"
                  value={formData.sellerName}
                  onChange={(event) => handleFieldChange("sellerName", event.target.value)}
                  onBlur={() => handleFieldBlur("sellerName")}
                  placeholder="Алексей"
                  hasError={Boolean((showErrors || touched.sellerName) && errors.sellerName)}
                />
              </FormField>

              <FormField
                label="Телефон"
                htmlFor="phone"
                required
                error={showErrors || touched.phone ? errors.phone : undefined}
              >
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) => handleFieldChange("phone", event.target.value)}
                  onBlur={() => handleFieldBlur("phone")}
                  placeholder="+7 (900) 000-00-00"
                  hasError={Boolean((showErrors || touched.phone) && errors.phone)}
                />
              </FormField>
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <FormField
              label="Способ связи"
              htmlFor="contactMethod"
              required
              error={showErrors || touched.contactMethod ? errors.contactMethod : undefined}
            >
              <Select
                id="contactMethod"
                value={formData.contactMethod}
                onChange={(event) =>
                  handleFieldChange(
                    "contactMethod",
                    event.target.value as CreateListingFormData["contactMethod"],
                  )
                }
                onBlur={() => handleFieldBlur("contactMethod")}
                hasError={Boolean((showErrors || touched.contactMethod) && errors.contactMethod)}
              >
                <option value="">Выберите способ связи</option>
                {contactMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Медиа</h2>
          <FormField
            label="Фотографии"
            htmlFor="listing-images"
            required
            error={showErrors ? errors.images : undefined}
            hint="Первое изображение обычно получает больше откликов"
          >
            <ImageUploader
              images={images}
              error={showErrors ? errors.images : undefined}
              onAddImages={handleAddImages}
              onRemoveImage={handleRemoveImage}
            />
          </FormField>
        </section>
      </div>

      <SubmitBar isValid={isValid} isSubmitting={isSubmitting} />
    </form>
  );
}

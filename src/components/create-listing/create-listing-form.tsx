"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

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
import { categories } from "@/lib/mock-data";

const contactMethods = [
  { id: "phone", label: "Только звонки" },
  { id: "chat", label: "Только сообщения" },
  { id: "both", label: "Звонки и сообщения" },
] as const;

const defaultForm: CreateListingFormData = {
  title: "",
  category: "",
  price: "",
  city: "",
  description: "",
  sellerName: "",
  phone: "",
  contactMethod: "",
};

function validateForm(values: CreateListingFormData, imagesCount: number): FormErrors {
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
  if (!values.sellerName.trim()) errors.sellerName = "Укажите имя продавца";
  if (!values.phone.trim()) {
    errors.phone = "Укажите номер телефона";
  } else if (!/^[+\d()\s-]{10,20}$/.test(values.phone.trim())) {
    errors.phone = "Введите корректный номер телефона";
  }
  if (!values.contactMethod) errors.contactMethod = "Выберите способ связи";
  if (imagesCount === 0) errors.images = "Добавьте хотя бы одно фото";

  return errors;
}

export function CreateListingForm() {
  const [formData, setFormData] = useState<CreateListingFormData>(defaultForm);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [touched, setTouched] = useState<Partial<Record<keyof CreateListingFormData, boolean>>>(
    {},
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => validateForm(formData, images.length), [formData, images.length]);
  const isValid = Object.keys(errors).length === 0;

  function resetForm() {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setFormData(defaultForm);
    setImages([]);
    setTouched({});
    setShowErrors(false);
    setIsSubmitted(false);
  }

  function handleFieldChange<K extends keyof CreateListingFormData>(
    field: K,
    value: CreateListingFormData[K],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
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

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✓
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
            href="/listings"
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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-8 p-4 sm:p-6">
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
                onChange={(event) =>
                  handleFieldChange("category", event.target.value as CreateListingFormData["category"])
                }
                onBlur={() => handleFieldBlur("category")}
                hasError={Boolean((showErrors || touched.category) && errors.category)}
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </FormField>

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

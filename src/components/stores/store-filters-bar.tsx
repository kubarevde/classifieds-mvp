"use client";

import { useState } from "react";

import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";

type FilterOption = {
  value: string;
  label: string;
};

export type StoreSortOption = "rating_desc" | "newest_desc" | "listings_desc";

type StoreFiltersBarProps = {
  /** When store type is chosen via scope chips above, hide duplicate type `<select>`. */
  hideStoreType?: boolean;
  world: string;
  onWorldChange: (value: string) => void;
  worldOptions: FilterOption[];
  type: string;
  onTypeChange: (value: string) => void;
  typeOptions: FilterOption[];
  rating: string;
  onRatingChange: (value: string) => void;
  ratingOptions: FilterOption[];
  city: string;
  onCityChange: (value: string) => void;
  cityOptions: FilterOption[];
  sortBy: StoreSortOption;
  onSortChange: (value: StoreSortOption) => void;
  onReset: () => void;
  /** Mobile: primary button label includes count when filters are active. */
  mobileActiveCount?: number;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
  optionKeyPrefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  optionKeyPrefix: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-h-[44px] w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
      >
        {options.map((option, index) => (
          <option key={`${optionKeyPrefix}-${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StoreFiltersBar({
  hideStoreType = false,
  world,
  onWorldChange,
  worldOptions,
  type,
  onTypeChange,
  typeOptions,
  rating,
  onRatingChange,
  ratingOptions,
  city,
  onCityChange,
  cityOptions,
  sortBy,
  onSortChange,
  onReset,
  mobileActiveCount,
}: StoreFiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mobileLabel =
    typeof mobileActiveCount === "number"
      ? isOpen
        ? "Свернуть"
        : `Фильтры${mobileActiveCount > 0 ? ` (${mobileActiveCount})` : ""}`
      : isOpen
        ? "Скрыть"
        : "Показать";

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-none sm:p-4">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <p className="text-sm font-semibold text-slate-900">
          {typeof mobileActiveCount === "number" ? "Уточнение выдачи" : "Фильтры и сортировка"}
        </p>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-xl px-3")}
        >
          {mobileLabel}
        </button>
      </div>

      <div className={`${isOpen ? "mt-3 block" : "hidden"} space-y-3 md:mt-0 md:block`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterSelect label="Мир" value={world} onChange={onWorldChange} options={worldOptions} optionKeyPrefix="world" />
          {!hideStoreType ? (
            <FilterSelect
              label="Категория магазина"
              value={type}
              onChange={onTypeChange}
              options={typeOptions}
              optionKeyPrefix="type"
            />
          ) : null}
          <FilterSelect
            label="Рейтинг"
            value={rating}
            onChange={onRatingChange}
            options={ratingOptions}
            optionKeyPrefix="rating"
          />
          <FilterSelect label="Город" value={city} onChange={onCityChange} options={cityOptions} optionKeyPrefix="city" />
          <FilterSelect
            label="Сортировка"
            value={sortBy}
            onChange={(value) => onSortChange(value as StoreSortOption)}
            options={[
              { value: "rating_desc", label: "По рейтингу" },
              { value: "newest_desc", label: "По новизне" },
              { value: "listings_desc", label: "По объявлениям" },
            ]}
            optionKeyPrefix="sort"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </section>
  );
}

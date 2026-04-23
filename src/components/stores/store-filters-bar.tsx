"use client";

import { useState } from "react";

type FilterOption = {
  value: string;
  label: string;
};

export type StoreSortOption = "rating_desc" | "newest_desc" | "listings_desc";

type StoreFiltersBarProps = {
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
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
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
}: StoreFiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <p className="text-sm font-semibold text-slate-900">Фильтры и сортировка</p>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {isOpen ? "Скрыть" : "Показать"}
        </button>
      </div>

      <div className={`${isOpen ? "mt-3 block" : "hidden"} space-y-3 md:mt-0 md:block`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterSelect label="Мир" value={world} onChange={onWorldChange} options={worldOptions} optionKeyPrefix="world" />
          <FilterSelect
            label="Категория магазина"
            value={type}
            onChange={onTypeChange}
            options={typeOptions}
            optionKeyPrefix="type"
          />
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
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </section>
  );
}

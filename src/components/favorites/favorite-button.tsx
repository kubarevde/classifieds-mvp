"use client";

import { MouseEvent } from "react";

import { useFavorites } from "@/components/favorites/favorites-provider";

type FavoriteButtonProps = {
  listingId: string;
  className?: string;
  stopPropagation?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
};

export function FavoriteButton({
  listingId,
  className = "",
  stopPropagation = false,
  size = "md",
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const favorite = isFavorite(listingId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    toggleFavorite(listingId);
  };

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorite}
      aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
      className={`inline-flex items-center justify-center rounded-full border transition ${
        favorite
          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
      } ${sizeClass} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={favorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className={iconSizeClass}
        aria-hidden="true"
      >
        <path d="M12 21s-6.5-4.6-9-8.2C1 10.3 1.3 7 4.2 5.3c2.1-1.2 4.6-.7 6.1 1.1L12 8.2l1.7-1.8c1.5-1.8 4-2.3 6.1-1.1 2.9 1.7 3.2 5 .2 7.5C18.5 16.4 12 21 12 21Z" />
      </svg>
      {showLabel ? (
        <span className="ml-2 text-sm font-medium">
          {isHydrated ? (favorite ? "В избранном" : "В избранное") : "В избранное"}
        </span>
      ) : null}
    </button>
  );
}

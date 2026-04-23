"use client";

import { MouseEvent } from "react";
import { Heart } from "lucide-react";

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
      <Heart
        className={iconSizeClass}
        fill={favorite ? "currentColor" : "none"}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {showLabel ? (
        <span className="ml-2 text-sm font-medium">
          {isHydrated ? (favorite ? "В избранном" : "В избранное") : "В избранное"}
        </span>
      ) : null}
    </button>
  );
}

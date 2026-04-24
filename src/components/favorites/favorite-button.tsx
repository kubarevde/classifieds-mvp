"use client";

import { MouseEvent } from "react";
import { Heart } from "lucide-react";

import { useFavorites } from "@/components/favorites/favorites-provider";
import Button from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

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

  const iconSizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const iconSlot = (
    <Heart
      className={iconSizeClass}
      fill={favorite ? "currentColor" : "none"}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );

  const buttonSize = showLabel
    ? size === "sm"
      ? "sm"
      : "md"
    : size === "sm"
      ? "iconSm"
      : "iconMd";

  return (
    <Button
      type="button"
      variant="ghost"
      size={buttonSize}
      onClick={handleClick}
      aria-pressed={favorite}
      aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
      leftIcon={iconSlot}
      className={cn(
        "rounded-full border",
        favorite
          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900",
        showLabel ? "w-auto gap-2 px-3" : "",
        className,
      )}
    >
      {showLabel ? (
        <span className="text-sm font-medium">
          {isHydrated ? (favorite ? "В избранном" : "В избранное") : "В избранное"}
        </span>
      ) : null}
    </Button>
  );
}

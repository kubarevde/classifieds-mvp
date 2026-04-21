import { ChangeEvent } from "react";

import { ListingImage } from "@/components/create-listing/types";

type ImageUploaderProps = {
  images: ListingImage[];
  error?: string;
  onAddImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (id: string) => void;
};

export function ImageUploader({ images, error, onAddImages, onRemoveImage }: ImageUploaderProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="listing-images"
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition ${
          error
            ? "border-rose-300 bg-rose-50/40 hover:bg-rose-50"
            : "border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <span className="text-sm font-semibold text-slate-800">Загрузите фото объявления</span>
        <span className="mt-1 text-xs text-slate-500">
          JPG/PNG до 10 MB. Можно выбрать несколько файлов.
        </span>
        <span className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition group-hover:bg-slate-700">
          Выбрать файлы
        </span>
      </label>
      <input
        id="listing-images"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={onAddImages}
        className="sr-only"
      />

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <figure key={image.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt={image.file.name}
                className="h-32 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(image.id)}
                className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white active:scale-95"
              >
                Удалить
              </button>
              <figcaption className="truncate border-t border-slate-200 px-2 py-1.5 text-xs text-slate-500">
                {image.file.name}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}

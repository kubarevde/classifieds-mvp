"use client";

import { ImagePlus, Search } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import { useToast } from "@/components/ui/toast";
import { searchListingsSmart, type WorldId } from "@/lib/worlds.community";

type WorldSearchProps = {
  worldId: WorldId;
  location: "all" | string;
  category: "all" | string;
};

export function WorldSearch({ worldId, location, category }: WorldSearchProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const href = searchListingsSmart({
      worldId,
      text,
      city: location === "all" ? undefined : location,
      categoryId: category === "all" ? undefined : category,
    });
    window.location.href = href;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">Найдите то, что вам нужно словами или по фото</p>
      <p className="mt-1 text-xs text-slate-500">Можно писать по-человечески: &quot;игровой ноутбук до 80 000 ₽&quot;</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder='Например: "Красивый красный диван"'
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ImagePlus className="h-4 w-4" />
          Найти по фото
        </button>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Поиск
        </button>
      </form>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={() => showToast("Поиск по фото будет доступен в следующем релизе", "info")}
      />
    </section>
  );
}

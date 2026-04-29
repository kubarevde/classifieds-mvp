type SubmitBarProps = {
  isValid: boolean;
  isSubmitting: boolean;
};

export function SubmitBar({ isValid, isSubmitting }: SubmitBarProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur sm:rounded-b-2xl sm:px-6 sm:pb-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 sm:text-sm">
          Проверьте поля перед отправкой. Публикация выполняется в демо-режиме.
        </p>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-[0.99]"
        >
          {isSubmitting ? "Публикуем..." : "Опубликовать объявление"}
        </button>
      </div>
    </div>
  );
}

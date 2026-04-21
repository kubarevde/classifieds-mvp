type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function MessageInput({ value, onChange, onSubmit }: MessageInputProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="border-t border-slate-200 p-3 sm:p-4"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Введите сообщение..."
          rows={1}
          className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
        >
          Отправить
        </button>
      </div>
    </form>
  );
}

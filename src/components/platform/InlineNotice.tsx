export type InlineNoticeTone = "info" | "warning" | "error" | "success";

export type InlineNoticeAction =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

export type InlineNoticeProps = {
  type: InlineNoticeTone;
  title: string;
  description?: string;
  action?: InlineNoticeAction;
  className?: string;
};

const toneClass: Record<InlineNoticeTone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  error: "border-rose-200 bg-rose-50 text-rose-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

export function InlineNotice({ type, title, description, action, className = "" }: InlineNoticeProps) {
  return (
    <div
      role="status"
      className={`rounded-xl border px-3 py-2 text-sm ${toneClass[type]} ${className}`.trim()}
    >
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-0.5 text-xs leading-relaxed opacity-90">{description}</p> : null}
      {action ? (
        <div className="mt-2">
          {"href" in action ? (
            <a href={action.href} className="text-xs font-semibold underline underline-offset-2">
              {action.label}
            </a>
          ) : (
            <button type="button" onClick={action.onClick} className="text-xs font-semibold underline underline-offset-2">
              {action.label}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

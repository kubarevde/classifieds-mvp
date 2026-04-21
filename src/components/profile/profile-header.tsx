type ProfileHeaderProps = {
  name: string;
  city: string;
  email: string;
  phone: string;
  registeredAtLabel: string;
  description: string;
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "?";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ProfileHeader({
  name,
  city,
  email,
  phone,
  registeredAtLabel,
  description,
}: ProfileHeaderProps) {
  const initials = getInitials(name);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-base font-semibold text-white shadow-md shadow-sky-200 sm:h-16 sm:w-16 sm:text-lg"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Профиль</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{name}</h2>
            <p className="text-sm text-slate-600">{city}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 sm:text-right">
          <p className="font-medium text-slate-800">На платформе с</p>
          <p className="text-sm font-semibold text-slate-900">{registeredAtLabel}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div className="space-y-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="truncate text-sm font-medium text-slate-900">{email}</dd>
        </div>
        <div className="space-y-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Телефон</dt>
          <dd className="text-sm font-medium text-slate-900">{phone}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">О себе</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{description || "—"}</p>
      </div>
    </section>
  );
}

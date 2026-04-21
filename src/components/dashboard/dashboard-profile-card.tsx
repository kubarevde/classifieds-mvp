import { SellerProfile } from "@/components/dashboard/types";

type DashboardProfileCardProps = {
  profile: SellerProfile;
};

export function DashboardProfileCard({ profile }: DashboardProfileCardProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Профиль продавца</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
          {profile.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{profile.name}</p>
          <p className="text-sm text-slate-600">{profile.city}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <dt>Телефон</dt>
          <dd className="font-medium text-slate-800">{profile.phone}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>На платформе</dt>
          <dd className="font-medium text-slate-800">{profile.memberSince}</dd>
        </div>
      </dl>
    </aside>
  );
}

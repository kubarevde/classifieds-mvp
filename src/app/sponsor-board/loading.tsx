export default function SponsorBoardLoading() {
  return (
    <div className="min-h-[40vh] animate-pulse bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-200" />
        <div className="h-4 max-w-xl rounded bg-slate-200" />
        <div className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

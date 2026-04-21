type DiscoveryOption = {
  id: string;
  label: string;
};

type DiscoveryStepCardProps = {
  title: string;
  subtitle: string;
  options: DiscoveryOption[];
  selected?: string;
  onSelect: (optionId: string) => void;
};

export function DiscoveryStepCard({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: DiscoveryStepCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-emerald-800">{title}</p>
      <p className="mt-1 text-sm text-stone-600">{subtitle}</p>

      <div className="mt-4 grid gap-2">
        {options.map((option) => {
          const isActive = selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

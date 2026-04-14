import { fitTypeLabels } from "@ecommerce/shared-utils";
import type { FitType } from "@ecommerce/shared-types";

interface FitTypeFilterProps {
  fitTypes: FitType[];
  selected: FitType | null;
  onChange: (value: FitType | null) => void;
  locale: string;
}

export function FitTypeFilter({ fitTypes, selected, onChange, locale }: FitTypeFilterProps) {
  const lang = locale === "ar" ? "ar" : "en";

  return (
    <div className="flex flex-wrap gap-2">
      {fitTypes.map((fitType) => {
        const isSelected = selected === fitType;
        const label = fitTypeLabels[fitType]?.[lang] ?? fitType;
        
        return (
          <button
            key={fitType}
            type="button"
            onClick={() => onChange(isSelected ? null : fitType)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              isSelected
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

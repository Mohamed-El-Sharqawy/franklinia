import { fabricLabels } from "@ecommerce/shared-utils";
import type { Fabric } from "@ecommerce/shared-types";

interface FabricFilterProps {
  fabrics: Fabric[];
  selected: Fabric | null;
  onChange: (value: Fabric | null) => void;
  locale: string;
}

export function FabricFilter({ fabrics, selected, onChange, locale }: FabricFilterProps) {
  const lang = locale === "ar" ? "ar" : "en";

  return (
    <div className="flex flex-wrap gap-2">
      {fabrics.map((fabric) => {
        const isSelected = selected === fabric;
        const label = fabricLabels[fabric]?.[lang] ?? fabric;
        
        return (
          <button
            key={fabric}
            type="button"
            onClick={() => onChange(isSelected ? null : fabric)}
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

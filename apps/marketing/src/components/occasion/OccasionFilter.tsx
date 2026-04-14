interface OccasionInfo {
  slug: string;
  nameEn: string;
  nameAr: string;
}

interface OccasionFilterProps {
  occasions: OccasionInfo[];
  selected: string | null;
  onChange: (slug: string | null) => void;
  locale: string;
}

export function OccasionFilter({ occasions, selected, onChange, locale }: OccasionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {occasions.map((occasion) => {
        const isSelected = selected === occasion.slug;
        const name = locale === "ar" ? occasion.nameAr : occasion.nameEn;
        
        return (
          <button
            key={occasion.slug}
            type="button"
            onClick={() => onChange(isSelected ? null : occasion.slug)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              isSelected
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

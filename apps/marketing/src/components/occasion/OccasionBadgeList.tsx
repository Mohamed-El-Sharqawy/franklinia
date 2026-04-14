import { OccasionBadge } from "./OccasionBadge";

interface OccasionInfo {
  slug: string;
  nameEn: string;
  nameAr: string;
}

interface OccasionBadgeListProps {
  occasions: OccasionInfo[];
  locale: string;
}

export function OccasionBadgeList({ occasions, locale }: OccasionBadgeListProps) {
  if (!occasions || occasions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {occasions.map((occasion) => (
        <OccasionBadge
          key={occasion.slug}
          slug={occasion.slug}
          nameEn={occasion.nameEn}
          nameAr={occasion.nameAr}
          locale={locale}
        />
      ))}
    </div>
  );
}

interface OccasionBadgeProps {
  nameEn: string;
  nameAr: string;
  slug: string;
  locale: string;
}

export function OccasionBadge({ nameEn, nameAr, slug, locale }: OccasionBadgeProps) {
  const name = locale === "ar" ? nameAr : nameEn;
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700"
      data-slug={slug}
    >
      {name}
    </span>
  );
}

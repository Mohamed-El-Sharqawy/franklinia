import { fabricLabels, fitTypeLabels, sleeveStyleLabels } from "@ecommerce/shared-utils";
import type { Fabric, FitType, SleeveStyle } from "@ecommerce/shared-types";

interface FashionAttributeSummaryProps {
  fabric: Fabric;
  fitType: FitType;
  sleeveStyle: SleeveStyle;
  locale: string;
}

export function FashionAttributeSummary({
  fabric,
  fitType,
  sleeveStyle,
  locale,
}: FashionAttributeSummaryProps) {
  const lang = locale === "ar" ? "ar" : "en";
  
  const fabricLabel = fabricLabels[fabric]?.[lang] ?? fabric;
  const fitTypeLabel = fitTypeLabels[fitType]?.[lang] ?? fitType;
  const sleeveStyleLabel = sleeveStyleLabels[sleeveStyle]?.[lang] ?? sleeveStyle;

  return (
    <span className="text-sm text-stone-500">
      {fabricLabel} · {fitTypeLabel} · {sleeveStyleLabel}
    </span>
  );
}

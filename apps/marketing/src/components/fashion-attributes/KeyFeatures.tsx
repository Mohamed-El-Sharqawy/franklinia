import {
  fabricLabels,
  fitTypeLabels,
  sleeveStyleLabels,
  embellishmentLabels,
  transparencyLayerLabels,
  garmentLengthLabels,
  necklineLabels,
} from "@ecommerce/shared-utils";
import type {
  Fabric,
  FitType,
  SleeveStyle,
  Embellishment,
  TransparencyLayer,
  GarmentLength,
  Neckline,
} from "@ecommerce/shared-types";

interface FashionAttributes {
  fabric: Fabric;
  fitType: FitType;
  sleeveStyle: SleeveStyle;
  embellishment?: Embellishment | null;
  transparencyLayer?: TransparencyLayer | null;
  length?: GarmentLength | null;
  neckline?: Neckline | null;
}

interface KeyFeaturesProps {
  attributes: FashionAttributes | null | undefined;
  locale: string;
}

export function KeyFeatures({ attributes, locale }: KeyFeaturesProps) {
  if (!attributes) return null;

  const lang = locale === "ar" ? "ar" : "en";

  const features: { label: string; value: string }[] = [];

  // Required fields
  if (attributes.fabric) {
    features.push({
      label: lang === "ar" ? "القماش" : "Fabric",
      value: fabricLabels[attributes.fabric]?.[lang] ?? attributes.fabric,
    });
  }

  if (attributes.fitType) {
    features.push({
      label: lang === "ar" ? "القصّة" : "Fit",
      value: fitTypeLabels[attributes.fitType]?.[lang] ?? attributes.fitType,
    });
  }

  if (attributes.sleeveStyle) {
    features.push({
      label: lang === "ar" ? "الأكمام" : "Sleeves",
      value: sleeveStyleLabels[attributes.sleeveStyle]?.[lang] ?? attributes.sleeveStyle,
    });
  }

  // Optional fields - only show if has value
  if (attributes.length) {
    features.push({
      label: lang === "ar" ? "الطول" : "Length",
      value: garmentLengthLabels[attributes.length]?.[lang] ?? attributes.length,
    });
  }

  if (attributes.embellishment && attributes.embellishment !== "NONE") {
    features.push({
      label: lang === "ar" ? "التطريز" : "Embellishment",
      value: embellishmentLabels[attributes.embellishment]?.[lang] ?? attributes.embellishment,
    });
  }

  if (attributes.transparencyLayer) {
    features.push({
      label: lang === "ar" ? "الشفافية" : "Transparency",
      value: transparencyLayerLabels[attributes.transparencyLayer]?.[lang] ?? attributes.transparencyLayer,
    });
  }

  if (attributes.neckline) {
    features.push({
      label: lang === "ar" ? "فتحة الرقبة" : "Neckline",
      value: necklineLabels[attributes.neckline]?.[lang] ?? attributes.neckline,
    });
  }

  if (features.length === 0) return null;

  return (
    <div className="py-6">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">
        {lang === "ar" ? "المميزات الرئيسية" : "Key Features"}
      </h3>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span className="font-medium text-stone-700">{feature.label}:</span>
            <span>{feature.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

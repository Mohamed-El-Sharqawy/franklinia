import type {
  Fabric,
  Embellishment,
  SleeveStyle,
  Neckline,
  FitType,
  GarmentLength,
  TransparencyLayer,
  BaseCategory,
  FitAdjustment,
} from "@ecommerce/shared-types";

type Label = { en: string; ar: string };

export const fabricLabels: Record<Fabric, Label> = {
  CHIFFON: { en: "Chiffon", ar: "شيفون" },
  CREPE: { en: "Crepe", ar: "كريب" },
  SATIN: { en: "Satin", ar: "ساتان" },
  LACE: { en: "Lace", ar: "دانتيل" },
  JERSEY: { en: "Jersey", ar: "جيرسي" },
  NIDHA: { en: "Nidha", ar: "نيدة" },
  LINEN: { en: "Linen", ar: "كتان" },
  VELVET: { en: "Velvet", ar: "مخمل" },
  ORGANZA: { en: "Organza", ar: "أورجانزا" },
  GEORGETTE: { en: "Georgette", ar: "جورجت" },
};

export const embellishmentLabels: Record<Embellishment, Label> = {
  EMBROIDERY: { en: "Embroidery", ar: "تطريز" },
  BEADS: { en: "Beads", ar: "خرز" },
  LACE_OVERLAY: { en: "Lace Overlay", ar: "طبقة دانتيل" },
  CRYSTAL: { en: "Crystal", ar: "كريستال" },
  SEQUINS: { en: "Sequins", ar: "ترتر" },
  NONE: { en: "None", ar: "بدون" },
};

export const sleeveStyleLabels: Record<SleeveStyle, Label> = {
  CAPE: { en: "Cape", ar: "كايك" },
  KIMONO: { en: "Kimono", ar: "كيمونو" },
  FLARED: { en: "Flared", ar: "واسع" },
  FITTED: { en: "Fitted", ar: "ضيق" },
  BELL: { en: "Bell", ar: "جلجل" },
  BATWING: { en: "Batwing", ar: "جناح خفاش" },
};

export const necklineLabels: Record<Neckline, Label> = {
  ROUND: { en: "Round", ar: "دائري" },
  V_NECK: { en: "V-Neck", ar: "V رقبة" },
  BOAT: { en: "Boat", ar: "قارب" },
  STAND_COLLAR: { en: "Stand Collar", ar: "ياقة قائمة" },
  HOODED: { en: "Hooded", ar: "بقلنسوة" },
  OPEN_FRONT: { en: "Open Front", ar: "مفتوح الأمام" },
};

export const fitTypeLabels: Record<FitType, Label> = {
  FLOWY: { en: "Flowy", ar: "فلوى" },
  RELAXED: { en: "Relaxed", ar: "مسترخي" },
  STRUCTURED: { en: "Structured", ar: "مهيكل" },
  A_LINE: { en: "A-Line", ar: "A خط" },
};

export const garmentLengthLabels: Record<GarmentLength, Label> = {
  FULL_LENGTH: { en: "Full Length", ar: "طويل بالكامل" },
  MIDI: { en: "Midi", ar: "ميدي" },
  KNEE_LENGTH: { en: "Knee Length", ar: "طول الركبة" },
};

export const transparencyLayerLabels: Record<TransparencyLayer, Label> = {
  INNER: { en: "Inner", ar: "داخلي" },
  OUTER: { en: "Outer", ar: "خارجي" },
  CLOSED: { en: "Closed", ar: "مغلق" },
};

export const baseCategoryLabels: Record<BaseCategory, Label> = {
  ABAYA: { en: "Abaya", ar: "عباية" },
  MODEST_DRESS: { en: "Modest Dress", ar: "فستان محتشم" },
};

export const fitAdjustmentLabels: Record<FitAdjustment, Label> = {
  LOOSE: { en: "Loose Fit", ar: "مريح" },
  RELAXED: { en: "Relaxed Fit", ar: "مسترخي" },
  STRUCTURED: { en: "Structured Fit", ar: "مهيكل" },
};

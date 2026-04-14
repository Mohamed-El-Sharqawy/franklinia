import type { FashionAttributes } from "@ecommerce/shared-types";

type PartialFashionAttrs = Partial<FashionAttributes>;

export function isCompleteFashionAttributes(attrs: PartialFashionAttrs): boolean {
  return (
    attrs.fabric != null &&
    attrs.embellishment != null &&
    attrs.sleeveStyle != null &&
    attrs.fitType != null &&
    attrs.transparencyLayer != null
  );
}

export function getMissingRequiredFields(attrs: PartialFashionAttrs): string[] {
  const missing: string[] = [];
  if (attrs.fabric == null) missing.push("fabric");
  if (attrs.embellishment == null) missing.push("embellishment");
  if (attrs.sleeveStyle == null) missing.push("sleeveStyle");
  if (attrs.fitType == null) missing.push("fitType");
  if (attrs.transparencyLayer == null) missing.push("transparencyLayer");
  return missing;
}

export function isValidForActivation(product: {
  fashionAttributes?: PartialFashionAttrs | null;
  occasions?: unknown[] | null;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!product.fashionAttributes || !isCompleteFashionAttributes(product.fashionAttributes)) {
    const missing = getMissingRequiredFields(product.fashionAttributes ?? {});
    errors.push(`Required fashion attribute fields missing: [${missing.join(", ")}]`);
  }

  if (!product.occasions || product.occasions.length === 0) {
    errors.push("At least one occasion required for active products");
  }

  return { valid: errors.length === 0, errors };
}

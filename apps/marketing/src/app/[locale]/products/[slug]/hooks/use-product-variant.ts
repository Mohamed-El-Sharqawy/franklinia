import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Product, ProductVariant } from "@ecommerce/shared-types";

export function useProductVariant(product: Product) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initialize Options State
  // We store selection as a Map of Option ID -> Value ID
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Try to recover from URL params or pick first variant's options
    const initial: Record<string, string> = {};
    
    // Check if a specific variant ID is in URL
    const variantIdParam = searchParams.get("variant");
    let baseVariant = product.variants?.find(v => v.id === variantIdParam || v.slug === variantIdParam);
    
    if (!baseVariant) {
      baseVariant = product.variants?.[0] || null;
    }

    if (baseVariant && (baseVariant as any).optionValues) {
      (baseVariant as any).optionValues.forEach((ov: any) => {
        initial[ov.optionId] = ov.id;
      });
    }
    
    return initial;
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 2. Derive current active variant
  const selectedVariant = useMemo(() => {
    if (!product.variants || Object.keys(selectedOptions).length === 0) return product.variants?.[0] || null;

    // Find variant that contains ALL selected option value IDs
    return product.variants.find((v: any) => {
      if (!v.optionValues) return false;
      const vOptionValueIds = v.optionValues.map((ov: any) => ov.id);
      return Object.values(selectedOptions).every(id => vOptionValueIds.includes(id));
    }) || null;
  }, [product.variants, selectedOptions]);

  // 3. Update URL when variant changes
  const updateURL = useCallback(
    (variant: ProductVariant) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", variant.id);
      // We could also set individual option params here if desired
      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // 4. Availability Logic (The "Lookahead")
  // Checks if a specific value is valid given the OTHER currently selected options
  const isOptionValueDisabled = useCallback((optionId: string, valueId: string) => {
    if (!product.variants) return true;

    // Create a hypothetical selection
    const hypotheticalOptions = { ...selectedOptions, [optionId]: valueId };
    
    // Check if ANY variant matches this set of options
    const exists = product.variants.some((v: any) => {
      if (!v.optionValues) return false;
      const vOptionValueIds = v.optionValues.map((ov: any) => ov.id);
      // For the lookahead, we only care about dimensions we've already interacted with + the target one
      return Object.entries(hypotheticalOptions).every(([optId, valId]) => {
         // If a variant is linked to a value of THIS option, it must be the target valueId
         const valueForThisOpt = v.optionValues.find((ov: any) => ov.optionId === optId);
         return valueForThisOpt?.id === valId;
      });
    });

    return !exists;
  }, [product.variants, selectedOptions]);

  // 5. Selection Handler
  const handleOptionSelect = useCallback((optionId: string, valueId: string) => {
    setSelectedOptions(prev => {
      const next = { ...prev, [optionId]: valueId };
      
      // Auto-reconcile other options if the new combination doesn't exist?
      // For now, we trust the UI to disable invalid buttons.
      // But if we do end up in an invalid state, we find the "closest" available variant.
      const match = product.variants?.find((v: any) => {
        const vOptionValueIds = v.optionValues.map((ov: any) => ov.id);
        return Object.values(next).every(id => vOptionValueIds.includes(id));
      });

      if (!match) {
        // Find FIRST variant that matches the NEW selection
        const fallback = product.variants?.find((v: any) => v.optionValues.some((ov: any) => ov.id === valueId));
        if (fallback && (fallback as any).optionValues) {
            const fallbackOptions: Record<string, string> = {};
            (fallback as any).optionValues.forEach((ov: any) => {
                fallbackOptions[ov.optionId] = ov.id;
            });
            updateURL(fallback);
            return fallbackOptions;
        }
      } else {
        updateURL(match);
      }

      return next;
    });
    setSelectedImageIndex(0);
  }, [product.variants, updateURL]);

  return {
    selectedVariant,
    selectedOptions,
    selectedImageIndex,
    setSelectedImageIndex,
    isOptionValueDisabled,
    handleOptionSelect,
  };
}

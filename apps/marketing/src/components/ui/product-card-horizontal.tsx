"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart, Eye } from "lucide-react";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { useCart } from "@/contexts/cart-context";
import { QuickViewModal } from "./quick-view-modal";
import { useTranslations } from "next-intl";
import { Badge } from "./badge";
import { Star, TrendingUp } from "lucide-react";

interface ProductCardHorizontalProps {
  product: Product;
  locale: string;
}

export function ProductCardHorizontal({
  product,
  locale,
}: ProductCardHorizontalProps) {
  const t = useTranslations("common");
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isArabic = locale === "ar";
  const name = isArabic ? product.nameAr : product.nameEn;
  const description = isArabic
    ? product.shortDescriptionAr || product.descriptionAr
    : product.shortDescriptionEn || product.descriptionEn;

  const price = selectedVariant?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const primaryImage = selectedVariant?.images?.[0]?.url;

  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  // Get first option type for variant selection (e.g., Color or Size)
  const firstOptionValues = product.variants
    ?.flatMap((v) => v.optionValues?.[0] ? [v.optionValues[0]] : [])
    .reduce((acc: any[], ov) => {
      if (!acc.find((a) => a.id === ov.id)) {
        acc.push(ov);
      }
      return acc;
    }, [] as Array<{ id: string; valueEn: string; valueAr: string }>)
    .slice(0, 8);

  const handleOptionClick = (optionValueId: string) => {
    const variant = product.variants?.find((v) => 
      v.optionValues?.some((ov) => ov.id === optionValueId)
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  return (
    <>
      <div className={`flex gap-8 py-8 border-b ${isArabic ? "flex-row-reverse" : ""}`}>
        {/* Image */}
        <Link href={`/products/${product.slug}`} className="relative w-1/3 max-w-[300px] shrink-0">
          <div className="relative aspect-3/4 bg-neutral-100">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={name}
                fill
                className="object-cover"
                sizes="300px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            {/* Badges Stack */}
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
              {discountPercent && (
                <Badge variant="destructive" size="sm" className="shadow-lg border-none">
                  -{discountPercent}%
                </Badge>
              )}

              {product.isFeatured && (
                <Badge variant="luxury" size="sm" className="flex gap-1.5 items-center border-none shadow-xl">
                  <Star className="h-2.5 w-2.5 fill-[#B8860B] text-[#B8860B]" />
                  {t("featured")}
                </Badge>
              )}

              {product.isTrending && (
                <Badge variant="trending" size="sm" className="flex gap-1.5 items-center border-none shadow-md">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {t("trending")}
                </Badge>
              )}

              {product.badge === "NEW" && (
                <Badge variant="outline" size="sm" className="border-black/5 shadow-sm">
                  {t("badges.new")}
                </Badge>
              )}

              {product.badge === "BESTSELLER" && (
                <Badge variant="outline" size="sm" className="border-black/5 shadow-sm">
                  {t("badges.bestseller")}
                </Badge>
              )}

              {product.badge === "LIMITED_EDITION" && (
                <Badge variant="luxury" size="sm" className="bg-indigo-950 border-none shadow-xl">
                  {t("badges.limitedEdition")}
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className={`flex-1 ${isArabic ? "text-right" : ""}`}>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-lg font-medium hover:underline">{name}</h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mt-1">
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                AED {compareAtPrice.toLocaleString()}
              </span>
            )}
            <span className="text-sm font-semibold text-red-600">
              AED {price.toLocaleString()}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {description}
            </p>
          )}

          {/* Variant Options */}
          {firstOptionValues && firstOptionValues.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {firstOptionValues.map((ov) => {
                const isSelected = selectedVariant?.optionValues?.some((v) => v.id === ov.id);
                return (
                  <button
                    key={ov.id}
                    onClick={() => handleOptionClick(ov.id)}
                    className={`min-w-[36px] px-2 py-1.5 text-xs font-medium border rounded transition ${isSelected
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:border-black"
                      }`}
                  >
                    {isArabic ? ov.valueAr : ov.valueEn}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              className="p-2 border rounded hover:bg-gray-100 transition"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="p-2 border rounded hover:bg-gray-100 transition"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        locale={locale}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

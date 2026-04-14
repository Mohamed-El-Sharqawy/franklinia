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
            <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10 pointer-events-none">
              {discountPercent && (
                <Badge variant="destructive" className="shadow-lg border-none text-[10px] md:text-xs px-2 py-0.5">
                  -{discountPercent}%
                </Badge>
              )}

              {product.isFeatured && (
                <Badge variant="luxury" className="flex gap-1.5 items-center border-none shadow-xl text-[10px] md:text-xs px-2 py-0.5">
                  <Star className="h-3 w-3 fill-[#B8860B] text-[#B8860B]" />
                  {t("featured")}
                </Badge>
              )}

              {product.isTrending && (
                <Badge variant="trending" className="flex gap-1.5 items-center border-none shadow-md text-[10px] md:text-xs px-2 py-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {t("trending")}
                </Badge>
              )}

              {product.badge === "NEW" && (
                <Badge variant="outline" className="border-black/5 shadow-sm text-[10px] md:text-xs px-2 py-0.5">
                  {t("badges.new")}
                </Badge>
              )}

              {product.badge === "BESTSELLER" && (
                <Badge variant="default" className="bg-amber-600 border-none shadow-md text-[10px] md:text-xs px-2 py-0.5">
                  {t("badges.bestseller")}
                </Badge>
              )}

              {product.badge === "LIMITED_EDITION" && (
                <Badge variant="luxury" className="bg-indigo-950 border-none shadow-xl text-[10px] md:text-xs px-2 py-0.5">
                  {t("badges.limitedEdition")}
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className={`flex-1 flex flex-col justify-center ${isArabic ? "text-right" : ""}`}>
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

          {/* Actions */}
          <div className={`flex items-center gap-3 mt-auto pt-6 ${isArabic ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-black/90 transition-colors"
            >
              <Eye className="h-4 w-4" />
              QUICK VIEW
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add favourite logic here
              }}
              className={`p-2.5 rounded-full border transition-colors border-gray-200 text-gray-600 hover:border-black hover:text-black`}
              aria-label="Add to favourites"
            >
              <Heart className="h-4 w-4" />
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

"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Eye, ShoppingBag, Heart, Bookmark, Minus, Plus, Check, Loader2, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { useCart } from "@/contexts/cart-context";
import { useFavourites } from "@/contexts/favourites-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { createCartItemFromVariant } from "@/lib/cart";
import { trackQuickAddToCart, trackFavouriteToggle, trackWishlistToggle } from "@/lib/analytics";
import { QuickViewModal } from "./quick-view-modal";
import { Badge } from "./badge";
import { TrendingUp, Star } from "lucide-react";

interface ProductCardWithVariantsProps {
  product: Product;
  locale: string;
}

export function ProductCardWithVariants({
  product,
  locale,
}: ProductCardWithVariantsProps) {
  const t = useTranslations("common");
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const { favouriteIds, addFavourite, removeFavourite } = useFavourites();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const isFavourite = favouriteIds.includes(product.id);
  const isInWishlist = wishlistItems.some((item) => item.productId === product.id);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Check if current variant is in cart
  const cartItem = useMemo(() => {
    if (!selectedVariant) return null;
    return cartItems.find((item) => item.variantId === selectedVariant.id);
  }, [cartItems, selectedVariant]);

  const isArabic = locale === "ar";
  const name = isArabic ? product.nameAr : product.nameEn;

  const price = selectedVariant?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const primaryImage = selectedVariant?.images?.[0]?.url;
  const hoverImage = selectedVariant?.images?.[1]?.url;

  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const handleQuickAdd = () => {
    if (!selectedVariant) return;

    setIsAdding(true);
    const newCartItem = createCartItemFromVariant(selectedVariant, {
      id: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
    });
    addItem(newCartItem);
    trackQuickAddToCart(product.id, selectedVariant.id, name, selectedVariant.price, 1);

    // Show success state briefly
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }, 300);
  };

  const handleIncrement = () => {
    if (cartItem && selectedVariant) {
      updateQuantity(selectedVariant.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem && selectedVariant) {
      updateQuantity(selectedVariant.id, cartItem.quantity - 1);
    }
  };

  return (
    <>
      <div
        className="group relative"
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => {
          setIsCardHovered(false);
        }}
      >
        <div
          className="relative"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <Link href={`/products/${product.slug}`} className="block select-none" draggable={false}>
            {/* bg-neutral-100 */}
            <div draggable={false} className="relative bg-neutral-100 overflow-hidden select-none rounded-xl" style={{ aspectRatio: '4/5' }}>
              {primaryImage ? (
                <>
                  <Image draggable={false}
                    src={primaryImage}
                    alt={name}
                    fill
                    className={`object-cover select-none transition-all duration-500 ease-out rounded-xl ${isImageHovered && hoverImage
                      ? "opacity-0 scale-105"
                      : "opacity-100 scale-100"
                      }`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {hoverImage && (
                    <Image draggable={false}
                      src={hoverImage}
                      alt={name}
                      fill
                      className={`object-cover select-none transition-all duration-700 ease-out pointer-events-none ${isImageHovered
                        ? "opacity-100 scale-110"
                        : "opacity-0 scale-100"
                        }`}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}

              {/* Badges Stack */}
              <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
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
                  <Badge variant="outline" className="border-black/5 shadow-sm text-[10px] md:text-xs px-2 py-0.5">
                    {t("badges.bestseller")}
                  </Badge>
                )}

                {product.badge === "LIMITED_EDITION" && (
                  <Badge variant="luxury" className="bg-indigo-950 border-none shadow-xl text-[10px] md:text-xs px-2 py-0.5">
                    {t("badges.limitedEdition")}
                  </Badge>
                )}
              </div>

              {/* Favourite & Wishlist Buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isFavourite) {
                      removeFavourite(product.id);
                      trackFavouriteToggle(product.id, "remove");
                    } else {
                      addFavourite(product.id);
                      trackFavouriteToggle(product.id, "add");
                    }
                  }}
                  className={`p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition hover:scale-110 ${isFavourite ? "text-red-500" : "text-gray-600 hover:text-red-500"
                    }`}
                  aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                  <Heart className={`h-4 w-4 ${isFavourite ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isInWishlist) {
                      removeFromWishlist(product.id);
                      trackWishlistToggle(product.id, "remove");
                    } else {
                      addToWishlist(product.id);
                      trackWishlistToggle(product.id, "add");
                    }
                  }}
                  className={`p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition hover:scale-110 ${isInWishlist ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
                    }`}
                  aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Bookmark className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </Link>

          {/* Hover Overlay with Quick Actions - Hidden on mobile, visible on tablets and up */}
          <div
            className={`hidden md:block absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm transition-all duration-300 ${isCardHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
              }`}
          >
            {/* Quick Action Buttons */}
            <div className="flex border-t border-gray-100">
              {cartItem ? (
                // Show quantity controls when item is in cart
                <>
                  <div className="flex-1 flex items-center justify-center gap-1 py-2 border-r">
                    <button
                      onClick={handleDecrement}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition active:scale-95"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{cartItem.quantity}</span>
                    <button
                      onClick={handleIncrement}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] md:text-xs font-semibold tracking-wider bg-black text-white hover:bg-black/90 transition uppercase"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {t("checkout")}
                  </Link>
                </>
              ) : (
                // Show quick add button when not in cart
                <>
                  <button
                    onClick={() => setIsQuickViewOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] md:text-xs font-semibold tracking-wider hover:bg-gray-50 transition uppercase border-r"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    QUICK VIEW
                  </button>
                  <button
                    onClick={handleQuickAdd}
                    disabled={isAdding}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] md:text-xs font-semibold tracking-wider hover:bg-gray-50 transition uppercase disabled:opacity-50"
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : justAdded ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <ShoppingBag className="h-3.5 w-3.5" />
                    )}
                    {isAdding ? "ADDING" : justAdded ? "ADDED" : "QUICK ADD"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-center space-y-1.5 px-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-[11px] md:text-xs font-medium uppercase tracking-[0.15em] line-clamp-1 group-hover:opacity-60 transition-opacity">
              {name}
            </h3>
          </Link>
          <div className="flex flex-col items-center gap-0.5">
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-[10px] text-muted-foreground line-through tracking-wider">
                AED {compareAtPrice.toLocaleString()}
              </span>
            )}
            <span className="text-xs font-semibold tracking-widest text-black">
              AED {price.toLocaleString()}
            </span>
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

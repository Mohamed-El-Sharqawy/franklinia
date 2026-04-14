"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { useCart } from "@/contexts/cart-context";
import { createCartItemFromVariant } from "@/lib/cart";

interface QuickViewModalProps {
  product: Product;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  locale,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const tCheckout = useTranslations("checkout");
  const { addItem } = useCart();

  const isArabic = locale === "ar";
  const name = isArabic ? product.nameAr : product.nameEn;
  const description = isArabic
    ? product.shortDescriptionAr || product.descriptionAr
    : product.shortDescriptionEn || product.descriptionEn;

  // 1. Initialize Options State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const baseVariant = product.variants?.[0] || null;

    if (baseVariant && (baseVariant as any).optionValues) {
      (baseVariant as any).optionValues.forEach((ov: any) => {
        initial[ov.optionId] = ov.id;
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 2. Derive current active variant
  const selectedVariant = product.variants?.find((v: any) => {
    if (!v.optionValues) return false;
    const vOptionValueIds = v.optionValues.map((ov: any) => ov.id);
    return Object.values(selectedOptions).every(id => vOptionValueIds.includes(id));
  }) || product.variants?.[0];

  // Swipe logic (Exactly as per hero-banner.tsx)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const activeImages = (selectedVariant?.images ?? []).map((img: any) => ({
    url: img.url || img.image?.url || "",
  }));

  const allOtherImages = product.variants
    ?.filter(v => v.id !== selectedVariant?.id)
    .flatMap(v => v.images ?? [])
    .map((img: any) => img.url || img.image?.url || "")
    .filter(Boolean) ?? [];

  const price = selectedVariant?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const goToNext = useCallback(() => {
    if (activeImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
  }, [activeImages.length]);

  const goToPrev = useCallback(() => {
    if (activeImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  }, [activeImages.length]);

  // 4. Availability Logic (The "Lookahead")
  const isOptionValueDisabled = useCallback((optionId: string, valueId: string) => {
    if (!product.variants) return true;

    const hypotheticalOptions = { ...selectedOptions, [optionId]: valueId };
    
    const exists = product.variants.some((v: any) => {
      if (!v.optionValues) return false;
      return Object.entries(hypotheticalOptions).every(([optId, valId]) => {
         const valueForThisOpt = v.optionValues.find((ov: any) => ov.optionId === optId);
         return valueForThisOpt?.id === valId;
      });
    });

    return !exists;
  }, [product.variants, selectedOptions]);

  // 5. Selection Handler
  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions(prev => {
      const next = { ...prev, [optionId]: valueId };
      
      const match = product.variants?.find((v: any) => {
        if (!v.optionValues) return false;
        const vOptionValueIds = v.optionValues.map((ov: any) => ov.id);
        return Object.values(next).every(id => vOptionValueIds.includes(id));
      });

      if (!match) {
        const fallback = product.variants?.find((v: any) => v.optionValues?.some((ov: any) => ov.id === valueId));
        if (fallback && (fallback as any).optionValues) {
            const fallbackOptions: Record<string, string> = {};
            (fallback as any).optionValues.forEach((ov: any) => {
                fallbackOptions[ov.optionId] = ov.id;
            });
            return fallbackOptions;
        }
      }

      return next;
    });
    setCurrentImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const cartItem = createCartItemFromVariant(
      selectedVariant,
      { id: product.id, slug: product.slug, nameEn: product.nameEn, nameAr: product.nameAr },
      quantity
    );
    addItem(cartItem);
    onClose();
  };

  // Swipe handlers (exactly like hero-banner.tsx)
  const handleStart = (clientX: number) => {
    setTouchStart(clientX);
    setTouchEnd(null);
  };

  const handleMove = (clientX: number) => {
    if (touchStart !== null) {
      setTouchEnd(clientX);
    }
  };

  const handleEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="hidden" aria-hidden="true">
        {allOtherImages.map((url, i) => (
          <Image key={i} src={url} alt="preload" width={1} height={1} priority={i < 5} />
        ))}
      </div>

      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      
      <div
        className={`relative bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ease-out ${isVisible
          ? "opacity-100 translate-x-0"
          : isClosing
            ? "opacity-0 translate-x-8"
            : "opacity-0 -translate-x-8"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 hover:bg-muted bg-white border border-gray-200 rounded-full shadow-sm"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 p-6 overflow-y-auto max-h-[90vh]">
          {/* Gallery Section with HeroBanner-style carousel logic */}
          <div 
            className="relative aspect-3/4 max-h-[380px] bg-neutral-50 overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => handleStart(e.targetTouches[0].clientX)}
            onTouchMove={(e) => handleMove(e.targetTouches[0].clientX)}
            onTouchEnd={handleEnd}
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
          >
            {/* Fade Gallery exactly like hero-banner.tsx */}
            {activeImages.map((img, i) => (
              <div 
                key={i} 
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`${name} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={i === 0}
                  draggable={false}
                />
              </div>
            ))}

            {/* Navigation Arrows (HeroBanner styling) */}
            {activeImages.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition z-10 bg-black/5 rounded-full backdrop-blur-sm"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition z-10 bg-black/5 rounded-full backdrop-blur-sm"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Dots Indicator (HeroBanner styling) */}
            {activeImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                {activeImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full border-2 border-white transition ${index === currentImageIndex ? "bg-white" : "bg-transparent"}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Detail Section */}
          <div className="space-y-5 p-6 md:p-0">
            {/* Breadcrumb */}
            <div className="text-xs text-gray-500">
              <Link href="/" className="hover:text-black transition">
                {t("home")}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-black">{name}</span>
            </div>

            {/* Product Title & Price */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-3">{name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">
                  Dhs. {price.toLocaleString()}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-sm text-gray-400 line-through">
                    Dhs. {compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Shipping Info */}
              <Link href="/shipping-policy" className="text-xs text-gray-600 underline hover:text-black transition mt-1 inline-block">
                {tCheckout("shipping")}
              </Link>
              <span className="text-xs text-gray-500"> calculated at checkout.</span>
            </div>

            {/* Viewing Indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>People are viewing this right now</span>
            </div>

            {/* Tabby Installment Info */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-600">As Low As </span>
                  <span className="font-semibold">Dhs. {(price / 4).toFixed(2)}</span>
                  <span className="text-gray-600"> /Month Or 4 Interest-Free Payments.</span>
                </div>
                <div className="bg-[#3DEDD7] text-black font-bold px-2 py-1 rounded text-xs">
                  tabby
                </div>
              </div>
              <button className="text-xs text-gray-600 underline hover:text-black transition mt-1">
                Learn More
              </button>
            </div>

            {/* Dynamic Variant Selection */}
            <div className="space-y-5">
              {product.options?.map((option) => {
                const isColor = option.nameEn.toLowerCase().includes("color");
                const selectedValueId = selectedOptions[option.id];

                return (
                  <div key={option.id} className="space-y-2">
                    <p className="text-sm font-medium">{isArabic ? option.nameAr : option.nameEn}</p>

                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isDisabled = isOptionValueDisabled(option.id, value.id);
                        const isSelected = selectedValueId === value.id;

                        if (isColor && value.hex) {
                          return (
                            <button
                              key={value.id}
                              disabled={isDisabled}
                              onClick={() => handleOptionSelect(option.id, value.id)}
                              className={`w-12 h-12 rounded-full border-2 transition-all relative ${isSelected
                                  ? "border-black ring-2 ring-offset-2 ring-black"
                                  : "border-gray-300"
                                } ${isDisabled ? "opacity-30 cursor-not-allowed" : "hover:scale-105"}`}
                              style={{ backgroundColor: value.hex }}
                              title={isArabic ? value.valueAr : value.valueEn}
                            >
                              {isDisabled && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-px h-full bg-gray-400 rotate-45" />
                                </div>
                              )}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={value.id}
                            disabled={isDisabled}
                            onClick={() => handleOptionSelect(option.id, value.id)}
                            className={`min-w-[60px] px-4 py-2.5 text-xs font-medium border transition-all ${isSelected
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-900 border-gray-300 hover:border-black"
                              } ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                          >
                            {isArabic ? value.valueAr : value.valueEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 border border-gray-300 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 hover:bg-gray-50 transition-colors active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[40px] text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 hover:bg-gray-50 transition-colors active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-white text-black border-2 border-black text-sm font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-all active:scale-[0.98]"
              >
                {tCommon("addToCart")}
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  window.location.href = `/${locale}/checkout`;
                }}
                className="w-full py-4 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-black/90 transition-all active:scale-[0.98]"
              >
                {tCommon("checkout")}
              </button>
            </div>

            {/* View Full Details Link */}
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center justify-center gap-1 text-center text-xs text-gray-600 hover:text-black transition mt-4"
              onClick={onClose}
            >
              View full details
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


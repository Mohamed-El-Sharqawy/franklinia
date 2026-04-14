import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Gift,
  Phone
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { Accordion, AccordionItem, Checkbox, SocialShare } from "@/components/ui";
import { KeyFeatures } from "@/components/fashion-attributes/KeyFeatures";
import { OccasionBadgeList } from "@/components/occasion/OccasionBadgeList";
import { LayeringNotice } from "@/components/fashion-attributes/LayeringNotice";
import { fitAdjustmentLabels } from "@ecommerce/shared-utils";
import { useState } from "react";

interface CartItemInfo {
  variantId: string;
  quantity: number;
}

interface ProductInfoProps {
  product: Product;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent: number | null;
  reviewCount: number;
  locale: string;
  // Variant selection (Dynamic)
  selectedOptions: Record<string, string>;
  selectedVariant: ProductVariant | null;
  onOptionSelect: (optionId: string, valueId: string) => void;
  isOptionValueDisabled: (optionId: string, valueId: string) => boolean;
  hasSizeGuide: boolean;
  onOpenSizeGuide: () => void;
  // Quantity
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  // Actions
  onAddToCart: () => void;
  onBuyNow: () => void;
  isFavourite: boolean;
  isInWishlist: boolean;
  onToggleFavourite: () => void;
  onToggleWishlist: () => void;
  // Cart state
  cartItem: CartItemInfo | null;
  onUpdateCartQuantity: (variantId: string, quantity: number) => void;
}

export function ProductInfo({
  product,
  name,
  price,
  compareAtPrice,
  discountPercent,
  reviewCount,
  locale,
  selectedOptions,
  selectedVariant,
  onOptionSelect,
  isOptionValueDisabled,
  hasSizeGuide,
  onOpenSizeGuide,
  quantity,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow,
  isFavourite,
  isInWishlist,
  onToggleFavourite,
  onToggleWishlist,
  cartItem,
  onUpdateCartQuantity,
}: ProductInfoProps) {
  const t = useTranslations("product");
  const isArabic = locale === "ar";
  const [addGiftMessage, setAddGiftMessage] = useState(false);

  const composition = [
    (product as any).fashionAttributes?.fabric,
    (product as any).fashionAttributes?.embellishment && (product as any).fashionAttributes?.embellishment !== 'NONE' 
      ? (product as any).fashionAttributes?.embellishment 
      : null,
    (product as any).fashionAttributes?.sleeveStyle,
    (product as any).fashionAttributes?.fitType,
  ].filter(Boolean).join(', ');

  const benefits = [
    { icon: <Truck className="h-4 w-4" />, text: isArabic ? "شحن مجاني خلال 1-2 أيام في الإمارات" : "Complimentary 1-2 days shipping in UAE" },
    { icon: <Truck className="h-4 w-4" />, text: isArabic ? "شحن مجاني في جميع أنحاء العالم" : "Complimentary worldwide shipping" },
    { icon: <RotateCcw className="h-4 w-4" />, text: isArabic ? "إرجاع سهل خلال 7 أيام" : "No questions asked 7 days easy returns" },
    { icon: <ShieldCheck className="h-4 w-4" />, text: isArabic ? "بطاقة أصالة المجوهرات" : "Jewellery authenticity card" },
    { icon: <Gift className="h-4 w-4" />, text: isArabic ? "تغليف هدايا سامرا الفاخر" : "Signature Samra gift wrapping" },
  ];

  return (
    <div className="space-y-8 flex flex-col">
      {/* Title & Price */}
      <div className="space-y-3">
        <h1 className="text-xl md:text-2xl font-medium tracking-tight text-gray-900">{name}</h1>
        {/* Occasion Badges */}
        {(product as any).occasions && (product as any).occasions.length > 0 && (
          <OccasionBadgeList
            occasions={(product as any).occasions.map((o: any) => o.occasion || o)}
            locale={locale}
          />
        )}
        {composition && (
          <p className="text-[11px] md:text-sm text-gray-500 font-light tracking-wide italic">
            {composition}
          </p>
        )}
        <div className="pt-2 flex items-center gap-3">
          <span className="text-lg md:text-xl font-medium">AED {price.toLocaleString()}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm md:text-base text-gray-400 line-through">
              AED {compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Gift Toggle */}
      <div className="py-4 border-t border-gray-100">
        <Checkbox
          id="gift-message"
          label={isArabic ? "أضف رسالة هدية" : "ADD A GIFT MESSAGE"}
          checked={addGiftMessage}
          onChange={setAddGiftMessage}
        />
      </div>

      {/* Dynamic Variant Selection */}
      <div className="space-y-8 py-6 border-y border-gray-100">
        {product.options?.map((option) => {
          const isColor = option.nameEn.toLowerCase().includes("color");
          const selectedValueId = selectedOptions[option.id];

          return (
            <div key={option.id} className="space-y-4">
              <div className="flex justify-between items-center text-[10px] md:text-xs font-medium uppercase tracking-[0.2em]">
                <p>{isArabic ? option.nameAr : option.nameEn}</p>
                {selectedValueId && (
                  <p className="text-gray-400 font-light normal-case">
                    {option.values.find((v) => v.id === selectedValueId)?.[isArabic ? 'valueAr' : 'valueEn']}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isDisabled = isOptionValueDisabled(option.id, value.id);
                  const isSelected = selectedValueId === value.id;

                  if (isColor && value.hex) {
                    return (
                      <button
                        key={value.id}
                        disabled={isDisabled}
                        onClick={() => onOptionSelect(option.id, value.id)}
                        className={`w-8 h-8 rounded-full border transition-all relative ${isSelected
                            ? "border-black ring-1 ring-offset-2 ring-black"
                            : "border-gray-200"
                          } ${isDisabled ? "opacity-20 cursor-not-allowed" : "hover:scale-110"}`}
                        style={{ backgroundColor: value.hex }}
                        title={isArabic ? value.valueAr : value.valueEn}
                      >
                        {isDisabled && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-px h-full bg-white rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  }

                  // Find variant with this option value to check fitAdjustment
                  const variantWithValue = product.variants?.find((v) =>
                    v.optionValues?.some((ov) => ov.id === value.id)
                  );
                  const fitLabel = variantWithValue?.fitAdjustment
                    ? fitAdjustmentLabels[variantWithValue.fitAdjustment]?.[isArabic ? "ar" : "en"]
                    : null;

                  return (
                    <button
                      key={value.id}
                      disabled={isDisabled}
                      onClick={() => onOptionSelect(option.id, value.id)}
                      className={`min-w-12 px-4 py-2 text-[10px] md:text-xs tracking-widest border transition-all ${isSelected
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-900 border-gray-200 hover:border-black"
                        } ${isDisabled ? "opacity-20 cursor-not-allowed text-gray-300" : ""}`}
                    >
                      {isArabic ? value.valueAr : value.valueEn}
                      {fitLabel && (
                        <span className="ml-1 text-[8px] opacity-70">
                          — {fitLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Actions */}
      <div className="space-y-4 mb-0">
        <button
          onClick={onAddToCart}
          className="w-full bg-black text-white py-4 text-[11px] font-medium uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors shadow-sm"
        >
          {isArabic ? "أضف إلى الحقبة" : "ADD TO BAG"}
        </button>

        {/* Benefits List */}
        <div className="space-y-3 pt-6">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-4 text-gray-600">
              <span className="text-gray-400">{benefit.icon}</span>
              <span className="text-[10px] md:text-xs font-light tracking-wider">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features Section */}
      {(product as any).fashionAttributes && (
        <div className="py-6 border-t border-gray-100">
          <KeyFeatures attributes={(product as any).fashionAttributes} locale={locale} />
        </div>
      )}

      {/* Layering Notice for OUTER transparency */}
      {(product as any).fashionAttributes?.transparencyLayer === "OUTER" && (
        <LayeringNotice transparencyLayer="OUTER" locale={locale} />
      )}

      {/* Accordions */}
      <div className="pt-4 border-t border-gray-100">
        <Accordion>
          <AccordionItem title={isArabic ? "الوصف" : "Description"}>
            <div className="space-y-4 text-xs md:text-sm font-light leading-relaxed tracking-wide">
              <p>{isArabic ? product.shortDescriptionAr : product.shortDescriptionEn}</p>
              {(isArabic ? product.descriptionAr : product.descriptionEn) && (
                <p>{isArabic ? product.descriptionAr : product.descriptionEn}</p>
              )}
            </div>
          </AccordionItem>
          <AccordionItem title={isArabic ? "الشحن والإرجاع" : "Shipping & Returns"}>
            <p className="text-xs font-light tracking-wide">{isArabic ? "نحن نقدم شحنًا مجانيًا في جميع أنحاء العالم لجميع الطلبات. الإرجاع متاح في غضون 7 أيام." : "We offer complimentary worldwide shipping on all orders. Returns are available within 7 days for any unworn items."}</p>
          </AccordionItem>
          <AccordionItem title={isArabic ? "تغليف الطلبات وتقديم الهدايا" : "Order Wrapping & Gifting"}>
            <p className="text-xs font-light tracking-wide">{isArabic ? "يصل كل طلب من سامرا مغلفًا بذوق رفيع في صندوق هدايا مميز." : "Every Samra order arrives exquisitely wrapped in our signature gift box."}</p>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-3 pt-6">
        <button
          onClick={onToggleWishlist}
          className="w-full py-3 border border-gray-900 text-[10px] font-medium uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          {isArabic ? (isInWishlist ? "حذف من قائمة الأمنيات" : "إضافة إلى قائمة الأمنيات") : (isInWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST")}
        </button>
      </div>

      {/* Info & SKU */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-400 hover:text-black transition-colors"><Phone className="h-4 w-4" /></a>
          <SocialShare
            title={name}
            image={product.variants?.[0]?.images?.[0]?.url}
          />
        </div>
        <div className="text-[9px] text-gray-400 uppercase tracking-widest font-light">
          SKU: {selectedVariant?.sku || "N/A"}
        </div>
      </div>
    </div>
  );
}

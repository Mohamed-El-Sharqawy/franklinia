"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AnimateOnScroll } from "@/components/ui";

interface Collection {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  image?: { url: string } | null;
  homeFeaturedPosition?: number;
}

interface HeroCollectionsProps {
  collections: Collection[];
  locale: string;
}

export function HeroCollections({ collections, locale }: HeroCollectionsProps) {
  const isArabic = locale === "ar";

  // Filter for abayas and modest-dresses, ordered by homeFeaturedPosition
  const featuredCollections = collections
    .filter(c => c.slug === "abayas" || c.slug === "modest-dresses")
    .sort((a, b) => (a.homeFeaturedPosition ?? 0) - (b.homeFeaturedPosition ?? 0));

  if (featuredCollections.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {featuredCollections.map((collection, index) => (
          <AnimateOnScroll
            key={collection.id}
            direction="up"
            delay={index * 0.1}
          >
            <Link
              href={`/collections/${collection.slug}`}
              className="group relative block aspect-4/3 md:aspect-4/5 overflow-hidden bg-neutral-100"
            >
              <Image
                src={collection.image?.url || "/images/collections/modest-dresses.png"}
                alt={isArabic ? collection.nameAr : collection.nameEn}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay with text at bottom */}
              <div className="absolute inset-x-0 bottom-0 py-12 md:py-20 flex flex-col items-center justify-end bg-linear-to-t from-black/30 via-transparent to-transparent text-white">
                <h3 className="text-xs md:text-sm font-light uppercase tracking-[0.5em] transition-transform duration-700 group-hover:-translate-y-2">
                  {isArabic ? collection.nameAr : collection.nameEn}
                </h3>
              </div>
            </Link>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}

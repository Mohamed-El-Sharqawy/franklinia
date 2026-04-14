import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AnimateOnScroll } from "@/components/ui";

interface PromoBannerProps {
  locale: string;
}

export async function PromoBanner({ locale }: PromoBannerProps) {
  const t = await getTranslations("home.promoBanner");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <AnimateOnScroll direction="up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white">
          {/* Image Section */}
          <div className="relative w-full aspect-3/4 md:aspect-auto md:min-h-[600px] overflow-hidden group">
            <Image
              src="/images/promo.png"
              alt="Promo Banner"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col items-center justify-center text-black text-center p-8 md:p-12 lg:p-16 bg-white">
            <div className="space-y-6 max-w-md">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                {t("title")}
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-gray-700">
                {t("description")}
              </p>
              <Link
                href="/collections/all-products"
                className="inline-block text-sm md:text-base font-semibold uppercase tracking-wider border-b-2 border-black pb-1 hover:opacity-70 transition-opacity"
              >
                {t("cta")}
              </Link>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

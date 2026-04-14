import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { apiGet } from "@/lib/api-client";
import type { Metadata } from "next";
import { generatePageMetadata, STATIC_PAGE_METADATA } from "@/lib/metadata";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

async function getPage() {
  try {
    const resp = await apiGet<{ success: boolean; data: any }>("/api/static/pages/about-us", { 
      next: { revalidate: 60 } 
    });
    return resp.success ? resp.data : null;
  } catch (error) {
    console.error("Failed to fetch about-us page from backend:", error);
    return null;
  }
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const cmsPage = await getPage();

  const title = cmsPage ? (isArabic ? cmsPage.titleAr : cmsPage.titleEn) : STATIC_PAGE_METADATA.home[locale as "en" | "ar"].title;
  const description = cmsPage ? (isArabic ? cmsPage.metaDescriptionAr : cmsPage.metaDescriptionEn) : STATIC_PAGE_METADATA.home[locale as "en" | "ar"].description;

  return generatePageMetadata({
    title,
    description: description || title,
    locale,
    path: "/about",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  const t = await getTranslations("about");
  const cmsPage = await getPage();

  const cmsContent = cmsPage ? (isArabic ? cmsPage.contentAr : cmsPage.contentEn) : null;
  const cmsTitle = cmsPage ? (isArabic ? cmsPage.titleAr : cmsPage.titleEn) : t("title");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/about/about.png"
          alt="About Franklinia"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <AnimateOnScroll direction="up">
            <h1 className="text-4xl md:text-6xl font-light uppercase tracking-[0.3em] mb-4">
              {cmsTitle}
            </h1>
            {!cmsPage && (
              <p className="text-sm md:text-base uppercase tracking-widest opacity-90">
                {t("story.subtitle")}
              </p>
            )}
          </AnimateOnScroll>
        </div>
      </section>

      {cmsContent ? (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <AnimateOnScroll direction="up">
              <div 
                className="prose prose-neutral max-w-none text-gray-700 leading-relaxed font-light text-center"
                dangerouslySetInnerHTML={{ __html: cmsContent }}
              />
            </AnimateOnScroll>
          </div>
        </section>
      ) : (
        <>
          {/* Story Section */}
          <section className="py-24 md:py-32 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <AnimateOnScroll direction="up">
                <div className="text-center space-y-8">
                  <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.25em]">
                    {t("story.title")}
                  </h2>
                  <div className="w-16 h-px bg-black/20 mx-auto" />
                  <p className="text-lg md:text-xl leading-relaxed font-light text-neutral-700">
                    {t("story.content")}
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </section>

          {/* Philosophy Section */}
          <section className="py-24 md:py-32 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <AnimateOnScroll direction="up">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.25em]">
                    {t("philosophy.title")}
                  </h2>
                  <div className="w-16 h-px bg-black/20 mx-auto" />
                </div>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {[
                  { 
                    title: t("philosophy.quality"), 
                    desc: t("philosophy.qualityDesc"),
                    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop"
                  },
                  { 
                    title: t("philosophy.craftsmanship"), 
                    desc: t("philosophy.craftsmanshipDesc"),
                    img: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&h=400&fit=crop"
                  },
                  { 
                    title: t("philosophy.innovation"), 
                    desc: t("philosophy.innovationDesc"),
                    img: "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?w=600&h=400&fit=crop"
                  }
                ].map((p, i) => (
                  <AnimateOnScroll key={i} direction="up" delay={i * 0.1}>
                    <div className="space-y-6">
                      <div className="relative aspect-video overflow-hidden rounded-sm">
                        <Image src={p.img} alt={p.title} fill className="object-cover" />
                      </div>
                      <h3 className="text-sm md:text-base font-medium uppercase tracking-[0.2em]">
                        {p.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-light">
                        {p.desc}
                      </p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <AnimateOnScroll direction="up">
            <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.3em] mb-12">
              {locale === "ar" ? "اكتشف مجموعتنا" : "Explore Our Collection"}
            </h2>
            <a 
              href="/collections/all-products"
              className="inline-block px-12 py-4 border border-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500"
            >
              {locale === "ar" ? "تسوق الآن" : "Shop Now"}
            </a>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}

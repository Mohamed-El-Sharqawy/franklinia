import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { generatePageMetadata, STATIC_PAGE_METADATA } from "@/lib/metadata";
import { apiGet } from "@/lib/api-client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getPolicy() {
  try {
    const resp = await apiGet<{ success: boolean; data: any }>("/api/static/policies/terms-of-service", { 
      next: { revalidate: 60 } 
    });
    return resp.success ? resp.data : null;
  } catch (error) {
    console.error("Failed to fetch terms of service from backend:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const cmsPolicy = await getPolicy();

  const title = cmsPolicy ? (isArabic ? cmsPolicy.titleAr : cmsPolicy.titleEn) : STATIC_PAGE_METADATA.termsOfService[locale as "en" | "ar"].title;
  const description = cmsPolicy ? (isArabic ? cmsPolicy.metaDescriptionAr : cmsPolicy.metaDescriptionEn) : STATIC_PAGE_METADATA.termsOfService[locale as "en" | "ar"].description;

  return generatePageMetadata({
    title,
    description: description || title,
    locale,
    path: "/terms-of-service",
  });
}

export default async function TermsOfServicePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  const t = await getTranslations("termsOfService");
  const cmsPolicy = await getPolicy();

  const title = cmsPolicy ? (isArabic ? cmsPolicy.titleAr : cmsPolicy.titleEn) : t("title");
  const content = cmsPolicy ? (isArabic ? cmsPolicy.contentAr : cmsPolicy.contentEn) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest">{title}</h1>

      {content ? (
        <div 
          className="prose prose-neutral max-w-none text-gray-600 leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">{t("intro.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("intro.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("use.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("use.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("account.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("account.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("purchase.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("purchase.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("intellectual.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("intellectual.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("termination.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("termination.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("changes.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("changes.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("contactUs.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("contactUs.description")}</p>
          </section>
        </div>
      )}
    </div>
  );
}

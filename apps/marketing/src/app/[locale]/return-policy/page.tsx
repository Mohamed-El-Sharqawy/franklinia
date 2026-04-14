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
    const resp = await apiGet<{ success: boolean; data: any }>("/api/static/policies/return-policy", { 
      next: { revalidate: 60 } 
    });
    return resp.success ? resp.data : null;
  } catch (error) {
    console.error("Failed to fetch return policy from backend:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const cmsPolicy = await getPolicy();

  const title = cmsPolicy ? (isArabic ? cmsPolicy.titleAr : cmsPolicy.titleEn) : STATIC_PAGE_METADATA.returnPolicy[locale as "en" | "ar"].title;
  const description = cmsPolicy ? (isArabic ? cmsPolicy.metaDescriptionAr : cmsPolicy.metaDescriptionEn) : STATIC_PAGE_METADATA.returnPolicy[locale as "en" | "ar"].description;

  return generatePageMetadata({
    title,
    description: description || title,
    locale,
    path: "/return-policy",
  });
}

export default async function ReturnPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  const t = await getTranslations("returnPolicy");
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
            <h2 className="text-xl font-semibold mb-4">{t("overview.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("overview.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("period.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("period.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("conditions.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("conditions.unused")}</li>
              <li>{t("conditions.tags")}</li>
              <li>{t("conditions.receipt")}</li>
              <li>{t("conditions.packaging")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("nonReturnable.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("nonReturnable.underwear")}</li>
              <li>{t("nonReturnable.custom")}</li>
              <li>{t("nonReturnable.sale")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("howTo.title")}</h2>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>{t("howTo.contact")}</li>
              <li>{t("howTo.authorization")}</li>
              <li>{t("howTo.pack")}</li>
              <li>{t("howTo.ship")}</li>
            </ol>
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

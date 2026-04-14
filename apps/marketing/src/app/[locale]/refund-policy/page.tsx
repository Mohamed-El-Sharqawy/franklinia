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
    const resp = await apiGet<{ success: boolean; data: any }>("/api/static/policies/refund-policy", { 
      next: { revalidate: 60 } 
    });
    return resp.success ? resp.data : null;
  } catch (error) {
    console.error("Failed to fetch refund policy from backend:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const cmsPolicy = await getPolicy();

  const title = cmsPolicy ? (isArabic ? cmsPolicy.titleAr : cmsPolicy.titleEn) : STATIC_PAGE_METADATA.refundPolicy[locale as "en" | "ar"].title;
  const description = cmsPolicy ? (isArabic ? cmsPolicy.metaDescriptionAr : cmsPolicy.metaDescriptionEn) : STATIC_PAGE_METADATA.refundPolicy[locale as "en" | "ar"].description;

  return generatePageMetadata({
    title,
    description: description || title,
    locale,
    path: "/refund-policy",
  });
}

export default async function RefundPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  const t = await getTranslations("refundPolicy");
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
            <h2 className="text-xl font-semibold mb-4">{t("eligibility.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("eligibility.time")}</li>
              <li>{t("eligibility.condition")}</li>
              <li>{t("eligibility.proof")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("process.title")}</h2>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>{t("process.submit")}</li>
              <li>{t("process.wait")}</li>
              <li>{t("process.return")}</li>
              <li>{t("process.receive")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("timeline.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("timeline.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("methods.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("methods.original")}</li>
              <li>{t("methods.credit")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("exceptions.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("exceptions.description")}</p>
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

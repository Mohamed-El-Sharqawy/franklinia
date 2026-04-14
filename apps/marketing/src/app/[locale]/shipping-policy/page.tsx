import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { generatePageMetadata, STATIC_PAGE_METADATA } from "@/lib/metadata";
import { apiGet } from "@/lib/api-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getPolicy() {
  try {
    const resp = await apiGet<{ success: boolean; data: any }>("/api/static/policies/shipping-policy", { 
      next: { revalidate: 60 } 
    });
    return resp.success ? resp.data : null;
  } catch (error) {
    console.error("Failed to fetch shipping policy from backend:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const cmsPolicy = await getPolicy();

  const title = cmsPolicy ? (isArabic ? cmsPolicy.titleAr : cmsPolicy.titleEn) : STATIC_PAGE_METADATA.shippingPolicy[locale as "en" | "ar"].title;
  const description = cmsPolicy ? (isArabic ? cmsPolicy.metaDescriptionAr : cmsPolicy.metaDescriptionEn) : STATIC_PAGE_METADATA.shippingPolicy[locale as "en" | "ar"].description;

  return generatePageMetadata({
    title,
    description: description || title,
    locale,
    path: "/shipping-policy",
  });
}

export default async function ShippingPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  const t = await getTranslations("shippingPolicy");
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
            <h2 className="text-xl font-semibold mb-4">{t("areas.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("areas.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("delivery.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("delivery.cairo")}</li>
              <li>{t("delivery.alexandria")}</li>
              <li>{t("delivery.other")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("costs.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("costs.cairo")}</li>
              <li>{t("costs.alexandria")}</li>
              <li>{t("costs.other")}</li>
              <li>{t("costs.free")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("tracking.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("tracking.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("cod.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("cod.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("notes.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("notes.address")}</li>
              <li>{t("notes.delays")}</li>
              <li>{t("notes.contact")}</li>
            </ul>
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

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
    const resp = await apiGet<{ success: boolean; data: any }>("/api/static/policies/privacy-policy", { 
      next: { revalidate: 60 } 
    });
    return resp.success ? resp.data : null;
  } catch (error) {
    console.error("Failed to fetch privacy policy from backend:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const cmsPolicy = await getPolicy();

  const title = cmsPolicy ? (isArabic ? cmsPolicy.titleAr : cmsPolicy.titleEn) : STATIC_PAGE_METADATA.privacyPolicy[locale as "en" | "ar"].title;
  const description = cmsPolicy ? (isArabic ? cmsPolicy.metaDescriptionAr : cmsPolicy.metaDescriptionEn) : STATIC_PAGE_METADATA.privacyPolicy[locale as "en" | "ar"].description;

  return generatePageMetadata({
    title,
    description: description || title,
    locale,
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  const t = await getTranslations("privacyPolicy");
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
            <h2 className="text-xl font-semibold mb-4">{t("collect.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("collect.contact")}</li>
              <li>{t("collect.address")}</li>
              <li>{t("collect.payment")}</li>
              <li>{t("collect.history")}</li>
              <li>{t("collect.preferences")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("use.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("use.process")}</li>
              <li>{t("use.communicate")}</li>
              <li>{t("use.improve")}</li>
              <li>{t("use.marketing")}</li>
              <li>{t("use.security")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("protection.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("protection.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("cookies.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("cookies.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("rights.title")}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("rights.access")}</li>
              <li>{t("rights.correct")}</li>
              <li>{t("rights.delete")}</li>
              <li>{t("rights.optout")}</li>
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

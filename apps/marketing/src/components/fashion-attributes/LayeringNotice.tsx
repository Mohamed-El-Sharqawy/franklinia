import { Info } from "lucide-react";

interface LayeringNoticeProps {
  transparencyLayer: string | null | undefined;
  locale: string;
}

export function LayeringNotice({ transparencyLayer, locale }: LayeringNoticeProps) {
  if (transparencyLayer !== "OUTER") return null;

  const isArabic = locale === "ar";

  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="text-amber-800 font-medium">
          {isArabic ? "This is an open-front abaya. An inner dress is recommended for layering." : "This is an open-front abaya. An inner dress is recommended for layering."}
        </p>
        <p className="text-amber-700 mt-1 text-xs">
          {isArabic ? "Perfect for layering over modest dresses for a complete look." : "Perfect for layering over modest dresses for a complete look."}
        </p>
      </div>
    </div>
  );
}

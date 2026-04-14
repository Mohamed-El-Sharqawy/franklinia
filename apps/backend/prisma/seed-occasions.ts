import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const OCCASIONS = [
  { slug: "eid", nameEn: "Eid", nameAr: "عيد", descriptionEn: "Eid collection — elegant pieces for the festive season.", descriptionAr: "تشكيلات عيد — قطع أناقة للموسم الاحتفالي.", isActive: true, position: 0 },
  { slug: "wedding", nameEn: "Wedding", nameAr: "فرح", descriptionEn: "Wedding collection — stunning looks for your special day.", descriptionAr: "تشكيلات فرح — إطلالات مذهلة ليومك الخاص.", isActive: true, position: 1 },
  { slug: "evening", nameEn: "Evening", nameAr: "سهره", descriptionEn: "Evening collection — sophisticated styles for evening events.", descriptionAr: "تشكيلات سهره — أناقة راقية للسهرات.", isActive: true, position: 2 },
  { slug: "casual", nameEn: "Casual", nameAr: "كاجوال", descriptionEn: "Casual collection — effortless everyday modesty.", descriptionAr: "تشكيلات كاجوال — احتشام يومي بلا مجهود.", isActive: true, position: 3 },
  { slug: "daily-elegance", nameEn: "Daily Elegance", nameAr: "أناقة يومية", descriptionEn: "Daily Elegance collection — refined modesty for every day.", descriptionAr: "تشكيلات أناقة يومية — احتشام راقٍ لكل يوم.", isActive: true, position: 4 },
];

export async function seedOccasions() {
  console.log("Seeding occasions...");
  for (const o of OCCASIONS) {
    await prisma.occasion.upsert({
      where: { slug: o.slug },
      create: o,
      update: o,
    });
  }
  console.log(`Seeded ${OCCASIONS.length} occasions.`);
}

// Allow standalone execution
if (require.main === module) {
  seedOccasions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

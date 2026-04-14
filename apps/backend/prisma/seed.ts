import { PrismaClient, FormType, FormStatus, BaseCategory, Fabric, Embellishment, SleeveStyle, FitType, TransparencyLayer, GarmentLength } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80";
const RICH_TEXT_SAMPLE = `
  <p>Our commitment to excellence ensures every piece of jewellery tells a unique story of elegance and craftsmanship.</p>
  <ul>
    <li>Hand-selected ethically sourced diamonds</li>
    <li>Master artisans with decades of experience</li>
    <li>Timeless designs that transcend generations</li>
  </ul>
  <p>Experience the luxury of Franklinia.</p>
`;

const OCCASIONS = [
  { slug: "eid", nameEn: "Eid", nameAr: "عيد", descriptionEn: "Eid collection — elegant pieces for the festive season.", descriptionAr: "تشكيلات عيد — قطع أناقة للموسم الاحتفالي.", isActive: true, position: 0 },
  { slug: "wedding", nameEn: "Wedding", nameAr: "فرح", descriptionEn: "Wedding collection — stunning looks for your special day.", descriptionAr: "تشكيلات فرح — إطلالات مذهلة ليومك الخاص.", isActive: true, position: 1 },
  { slug: "evening", nameEn: "Evening", nameAr: "سهره", descriptionEn: "Evening collection — sophisticated styles for evening events.", descriptionAr: "تشكيلات سهره — أناقة راقية للسهرات.", isActive: true, position: 2 },
  { slug: "casual", nameEn: "Casual", nameAr: "كاجوال", descriptionEn: "Casual collection — effortless everyday modesty.", descriptionAr: "تشكيلات كاجوال — احتشام يومي بلا مجهود.", isActive: true, position: 3 },
  { slug: "daily-elegance", nameEn: "Daily Elegance", nameAr: "أناقة يومية", descriptionEn: "Daily Elegance collection — refined modesty for every day.", descriptionAr: "تشكيلات أناقة يومية — احتشام راقٍ لكل يوم.", isActive: true, position: 4 },
];

const COLLECTIONS = [
  { slug: "abayas", nameEn: "Abayas", nameAr: "عبايات", descriptionEn: "Elegant abayas for every occasion.", descriptionAr: "عبايات أناقة لكل مناسبة.", isFeaturedOnHome: true, homeFeaturedPosition: 0 },
  { slug: "modest-dresses", nameEn: "Modest Dresses", nameAr: "فساتين محتشمة", descriptionEn: "Modest dresses with timeless elegance.", descriptionAr: "فساتين محتشمة بأناقة خالدة.", isFeaturedOnHome: true, homeFeaturedPosition: 1 },
];

async function clearDatabase() {
  console.log("Clearing database...");
  const tablenames = (await prisma.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname='public'"
  )) as any[];

  const tables = tablenames
    .map((row) => row.tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  if (!tables) {
    console.log("No tables found to clear.");
    return;
  }

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
    console.log("Database cleared.");
  } catch (error) {
    console.log("Truncate failed, attempting manual delete...");
    // Fallback for manual deletion if raw SQL fails or restricted
    await prisma.formSubmission.deleteMany();
    await prisma.policy.deleteMany();
    await prisma.page.deleteMany();
    await prisma.review.deleteMany();
    await prisma.shoppableVideo.deleteMany();
    await prisma.instagramPost.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.productVariantImage.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productOptionValue.deleteMany();
    await prisma.productOption.deleteMany();
    await prisma.productCustomField.deleteMany();
    await prisma.product.deleteMany();
    await prisma.collectionImage.deleteMany();
    await prisma.collectionBanner.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.productOccasion.deleteMany();
    await prisma.occasion.deleteMany();
    await prisma.fashionAttributes.deleteMany();
    await prisma.user.deleteMany();
    console.log("Database cleared manually.");
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

async function main() {
  await clearDatabase();

  console.log("Seeding occasions...");
  const occasions = await Promise.all(OCCASIONS.map(o => prisma.occasion.create({ data: o })));

  console.log("Seeding collections...");
  const collections = await Promise.all(
    COLLECTIONS.map((c) =>
      prisma.collection.create({
        data: {
          slug: c.slug,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          descriptionEn: c.descriptionEn,
          descriptionAr: c.descriptionAr,
          isFeaturedOnHome: c.isFeaturedOnHome,
          homeFeaturedPosition: c.homeFeaturedPosition,
          isActive: true,
          image: {
            create: {
              url: PLACEHOLDER_IMAGE,
              publicId: `seed-col-${c.slug}`,
              altEn: c.nameEn,
              altAr: c.nameAr,
            },
          },
        },
      })
    )
  );

  console.log("Seeding Static Content...");
  await prisma.page.createMany({
    data: [
      { slug: "about-us", titleEn: "About Us", titleAr: "عن شركتنا", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
      { slug: "size-guide", titleEn: "Size Guide", titleAr: "دليل المقاسات", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
    ],
  });

  await prisma.policy.createMany({
    data: [
      { slug: "privacy-policy", titleEn: "Privacy Policy", titleAr: "سياسة الخصوصية", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
      { slug: "shipping-policy", titleEn: "Shipping Policy", titleAr: "سياسة الشحن", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
      { slug: "refund-policy", titleEn: "Refund Policy", titleAr: "سياسة الاسترداد", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
      { slug: "return-policy", titleEn: "Return Policy", titleAr: "سياسة الإرجاع", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
      { slug: "terms-of-service", titleEn: "Terms of Service", titleAr: "شروط الخدمة", contentEn: RICH_TEXT_SAMPLE, contentAr: RICH_TEXT_SAMPLE, isActive: true },
    ],
  });

  await prisma.banner.create({
    data: {
      titleEn: "Luxury Defined", titleAr: "تعريف الفخامة",
      subtitleEn: "Exquisite jewellery for the modern elegance.", subtitleAr: "مجوهرات رائعة للأناقة العصرية.",
      imageUrl: PLACEHOLDER_IMAGE, publicId: "seed-banner", isActive: true, position: 0,
    },
  });

  console.log("Seeding Products & Variants...");
  const productData = [
    { nameEn: "The Amethyst Geometric Abaya", nameAr: "عباية أميثست هندسية", colIdx: 0, price: 550, baseCategory: BaseCategory.ABAYA, fabric: Fabric.NIDHA, embellishment: Embellishment.EMBROIDERY, sleeveStyle: SleeveStyle.CAPE, fitType: FitType.FLOWY, transparencyLayer: TransparencyLayer.CLOSED, length: GarmentLength.FULL_LENGTH, occasionIdx: [0, 2] },
    { nameEn: "Sage Grace Modest Dress", nameAr: "فستان سيد جريس محتشم", colIdx: 1, price: 420, baseCategory: BaseCategory.MODEST_DRESS, fabric: Fabric.CREPE, embellishment: Embellishment.NONE, sleeveStyle: SleeveStyle.KIMONO, fitType: FitType.RELAXED, transparencyLayer: TransparencyLayer.CLOSED, length: GarmentLength.FULL_LENGTH, occasionIdx: [1, 3] },
  ];

  for (const p of productData) {
    const product = await prisma.product.create({
      data: {
        slug: slugify(p.nameEn),
        nameEn: p.nameEn, nameAr: p.nameAr,
        descriptionEn: "Crafted with care and attention to detail.", descriptionAr: "صنعت بعناية واهتمام بالتفاصيل.",
        baseCategory: p.baseCategory, isActive: true, isFeatured: true, position: 0,
        collectionId: collections[p.colIdx].id,
        fashionAttributes: {
          create: {
            fabric: p.fabric,
            embellishment: p.embellishment,
            sleeveStyle: p.sleeveStyle,
            fitType: p.fitType,
            transparencyLayer: p.transparencyLayer,
            length: p.length,
          },
        },
        occasions: {
          create: p.occasionIdx.map((idx, i) => ({
            occasionId: occasions[idx].id,
            position: i,
          })),
        },
      },
    });

    // Create Options
    const optColor = await prisma.productOption.create({
      data: { nameEn: "Color", nameAr: "اللون", position: 0, productId: product.id },
    });
    const optSize = await prisma.productOption.create({
      data: { nameEn: "Size", nameAr: "المقاس", position: 1, productId: product.id },
    });

    // Create Option Values
    const valYellow = await prisma.productOptionValue.create({
      data: { valueEn: "Yellow Gold", valueAr: "ذهب أصفر", hex: "#E6C15A", position: 0, optionId: optColor.id },
    });
    const valWhite = await prisma.productOptionValue.create({
      data: { valueEn: "White Gold", valueAr: "ذهب أبيض", hex: "#F3F3F3", position: 1, optionId: optColor.id },
    });
    const valSmall = await prisma.productOptionValue.create({
      data: { valueEn: "Small", valueAr: "صغير", position: 0, optionId: optSize.id },
    });
    const valLarge = await prisma.productOptionValue.create({
      data: { valueEn: "Large", valueAr: "كبير", position: 1, optionId: optSize.id },
    });

    // Create Variants
    const variants = [
      { name: "Yellow - Small", vals: [valYellow.id, valSmall.id], price: p.price },
      { name: "White - Large", vals: [valWhite.id, valLarge.id], price: p.price + 500 },
    ];

    for (const v of variants) {
      const variant = await prisma.productVariant.create({
        data: {
          slug: `${product.slug}-${slugify(v.name)}`,
          productId: product.id,
          nameEn: v.name, nameAr: v.name,
          sku: `SKU-${product.id}-${slugify(v.name)}`,
          price: v.price, stock: 50, isActive: true,
          optionValues: { connect: v.vals.map(id => ({ id })) },
        },
      });

      const img = await prisma.productImage.create({
        data: {
          productId: product.id, url: PLACEHOLDER_IMAGE, publicId: `img-${variant.id}`,
          altEn: v.name, altAr: v.name,
        },
      });

      await prisma.productVariantImage.create({
        data: { variantId: variant.id, imageId: img.id, position: 0 },
      });
    }

    // Update product display
    const allVariants = await prisma.productVariant.findMany({ where: { productId: product.id } });
    await prisma.product.update({
      where: { id: product.id },
      data: { defaultVariantId: allVariants[0].id, hoverVariantId: allVariants[1]?.id || allVariants[0].id },
    });
  }

  console.log("Seeding Engagement Data...");
  await prisma.formSubmission.create({
    data: {
      type: FormType.CONTACT,
      status: FormStatus.PENDING,
      payload: { name: "John Doe", email: "john@example.com", message: "Love your collection!" },
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

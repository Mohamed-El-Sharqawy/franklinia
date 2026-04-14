import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useAllCollections } from "@/features/collections";
import {
  useCreateProduct,
  useUploadProductImages,
  useLinkImageToVariant,
} from "@/features/products";
import type { CreateProductBody } from "@/features/products";
import { ProductOptionsManager, type ProductOptionForm } from "@/features/products/components/ProductOptionsManager";
import { VariantMatrix, type VariantForm } from "@/features/products/components/VariantMatrix";
import { CustomFieldsManager, type CustomFieldForm } from "@/features/products/components/CustomFieldsManager";
import { BaseCategorySelect } from "@/features/products/components/BaseCategorySelect";
import { FashionAttributesForm, type FashionAttributesInput } from "@/features/products/components/FashionAttributesForm";
import { OccasionSelector } from "@/features/products/components/OccasionSelector";
import { ProductBadge, BaseCategory } from "@ecommerce/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

// Staged image with file and linked variant tempIds
interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
  linkedVariantTempIds: string[];
}

export function NewProductPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const uploadProductImagesMutation = useUploadProductImages();
  const linkImageToVariantMutation = useLinkImageToVariant();

  const { data: collectionsRes } = useAllCollections();

  const collections = collectionsRes?.data ?? [];

  // Basic Info state
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [shortDescriptionEn, setShortDescriptionEn] = useState("");
  const [shortDescriptionAr, setShortDescriptionAr] = useState("");
  const [metaTitleEn, setMetaTitleEn] = useState("");
  const [metaTitleAr, setMetaTitleAr] = useState("");
  const [metaDescriptionEn, setMetaDescriptionEn] = useState("");
  const [metaDescriptionAr, setMetaDescriptionAr] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [badge, setBadge] = useState<ProductBadge | "">("");
  const [position, setPosition] = useState(0);
  const [baseCategory, setBaseCategory] = useState<BaseCategory | "">("");
  const [fashionAttributes, setFashionAttributes] = useState<FashionAttributesInput>({
    fabric: "",
    embellishment: "NONE",
    sleeveStyle: "",
    fitType: "",
    transparencyLayer: "",
    neckline: null,
    length: null,
  });
  const [occasionIds, setOccasionIds] = useState<string[]>([]);
  const [occasionPositions, setOccasionPositions] = useState<Record<string, number>>({});

  // New Complex State
  const [options, setOptions] = useState<ProductOptionForm[]>([]);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldForm[]>([]);

  // Staged images state
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // Image Handlers
  const handleAddStagedImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImages: StagedImage[] = Array.from(files).map((file) => ({
      id: `staged-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      linkedVariantTempIds: [],
    }));
    setStagedImages((prev) => [...prev, ...newImages]);
  };

  const removeStagedImage = (imageId: string) => {
    setStagedImages((prev) => {
      const img = prev.find((i) => i.id === imageId);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== imageId);
    });
  };

  const toggleImageVariantLink = (imageId: string, variantIndex: number) => {
    const variantKey = `idx-${variantIndex}`;
    setStagedImages((prev) =>
      prev.map((img) => {
        if (img.id !== imageId) return img;
        const isLinked = img.linkedVariantTempIds.includes(variantKey);
        return {
          ...img,
          linkedVariantTempIds: isLinked
            ? img.linkedVariantTempIds.filter((id) => id !== variantKey)
            : [...img.linkedVariantTempIds, variantKey],
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr) {
      toast.error("Name is required in both languages");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading("Creating product...");

    try {
      const productBody: CreateProductBody = {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        shortDescriptionEn: shortDescriptionEn || undefined,
        shortDescriptionAr: shortDescriptionAr || undefined,
        metaTitleEn: metaTitleEn || undefined,
        metaTitleAr: metaTitleAr || undefined,
        metaDescriptionEn: metaDescriptionEn || undefined,
        metaDescriptionAr: metaDescriptionAr || undefined,
        baseCategory: baseCategory || undefined,
        collectionId: collectionId || undefined,
        isActive,
        isFeatured,
        isTrending,
        badge: badge || undefined,
        position,
        fashionAttributes: fashionAttributes.fabric ? {
          fabric: fashionAttributes.fabric,
          embellishment: fashionAttributes.embellishment || "NONE",
          sleeveStyle: fashionAttributes.sleeveStyle,
          fitType: fashionAttributes.fitType,
          transparencyLayer: fashionAttributes.transparencyLayer,
          neckline: fashionAttributes.neckline || undefined,
          length: fashionAttributes.length || undefined,
        } : undefined,
        occasionIds: occasionIds.length > 0 ? occasionIds : undefined,
        occasionPositions: Object.keys(occasionPositions).length > 0 ? occasionPositions : undefined,
        options: options.map(opt => ({
          nameEn: opt.nameEn,
          nameAr: opt.nameAr,
          position: opt.position,
          values: opt.values.map(v => ({
            valueEn: v.valueEn,
            valueAr: v.valueAr,
            hex: v.hex,
            position: v.position
          }))
        })),
        customFields: customFields.map(cf => ({
          type: cf.type,
          labelEn: cf.labelEn,
          labelAr: cf.labelAr,
          placeholderEn: cf.placeholderEn || undefined,
          placeholderAr: cf.placeholderAr || undefined,
          isRequired: cf.isRequired
        })),
        variants: variants.map(v => ({
          nameEn: v.nameEn,
          nameAr: v.nameAr,
          sku: v.sku || undefined,
          price: parseFloat(v.price) || 0,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
          stock: parseInt(v.stock) || 0,
          isActive: v.isActive
        }))
      };

      const result = await createMutation.mutateAsync(productBody);
      const createdProduct = result.data;
      if (!createdProduct) throw new Error("Product creation failed");

      // Step 2: Upload images and link back
      if (stagedImages.length > 0) {
        toast.loading("Uploading images...", { id: loadingToastId });
        
        for (const stagedImg of stagedImages) {
          try {
            const uploadResult = await uploadProductImagesMutation.mutateAsync({
              productId: createdProduct.id,
              files: [stagedImg.file]
            });
            const uploadedImage = uploadResult.data?.[0];
            
            if (uploadedImage && stagedImg.linkedVariantTempIds.length > 0) {
              const linkedVariantIndices = stagedImg.linkedVariantTempIds
                .map(key => parseInt(key.replace("idx-", "")));
              
              for (const idx of linkedVariantIndices) {
                const realVariant = createdProduct.variants[idx];
                if (realVariant) {
                  await linkImageToVariantMutation.mutateAsync({
                    imageId: uploadedImage.id,
                    variantId: realVariant.id
                  });
                }
              }
            }
          } catch (err) {
            console.error("Image upload failed", err);
          }
        }
      }

      toast.success("Product created successfully", { id: loadingToastId });
      navigate(`/products/${createdProduct.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product", { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
          <p className="text-muted-foreground text-lg">Create a new relational product with variants and tailoring options</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-8">
          <TabsList className="grid grid-cols-5 w-full bg-muted/50 p-1">
            <TabsTrigger value="basic">General</TabsTrigger>
            <TabsTrigger value="media">Media ({stagedImages.length})</TabsTrigger>
            <TabsTrigger value="variants">Options & Variants</TabsTrigger>
            <TabsTrigger value="custom">Customization</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 animate-in fade-in-50 duration-300">
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English) *</Label>
                    <Input id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required placeholder="e.g. Classic Black Abaya" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">Name (Arabic) *</Label>
                    <Input id="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" required placeholder="عباية سوداء كلاسيكية" className="h-11" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">Description (English)</Label>
                    <Textarea id="descriptionEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={5} placeholder="Full product description..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea id="descriptionAr" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" rows={5} placeholder="وصف كامل للمنتج..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shortDescriptionEn">Short Description (English)</Label>
                    <Textarea id="shortDescriptionEn" value={shortDescriptionEn} onChange={(e) => setShortDescriptionEn(e.target.value)} rows={2} placeholder="Brief summary..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescriptionAr">Short Description (Arabic)</Label>
                    <Textarea id="shortDescriptionAr" value={shortDescriptionAr} onChange={(e) => setShortDescriptionAr(e.target.value)} dir="rtl" rows={2} placeholder="ملخص بسيط..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Organization & Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Collection</Label>
                    <Select value={collectionId || "none"} onValueChange={(v) => setCollectionId(v === "none" ? "" : v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Collection</SelectItem>
                        {collections.filter((c: any) => !c.parentId).map((parent: any) => (
                          <div key={parent.id}>
                            <SelectItem value={parent.id} className="font-semibold">{parent.nameEn}</SelectItem>
                            {collections.filter((c: any) => c.parentId === parent.id).map((child: any) => (
                              <SelectItem key={child.id} value={child.id} className="pl-6 text-muted-foreground">&gt; {child.nameEn}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Badge</Label>
                    <Select value={badge || "none"} onValueChange={(v) => setBadge(v === "none" ? "" : v as ProductBadge)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Badge</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="BESTSELLER">Bestseller</SelectItem>
                        <SelectItem value="LIMITED_EDITION">Limited Edition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" type="number" value={position} onChange={(e) => setPosition(parseInt(e.target.value) || 0)} className="h-11" />
                  </div>
                </div>

                {/* Fashion Domain Fields */}
                <div className="border-t pt-6 space-y-6">
                  <h4 className="text-sm font-medium text-muted-foreground">Fashion Attributes</h4>
                  <BaseCategorySelect
                    value={baseCategory}
                    onChange={(v) => setBaseCategory(v as BaseCategory)}
                  />
                  <FashionAttributesForm
                    value={fashionAttributes}
                    onChange={setFashionAttributes}
                  />
                  <OccasionSelector
                    selectedIds={occasionIds}
                    onChange={(ids, positions) => {
                      setOccasionIds(ids);
                      setOccasionPositions(positions);
                    }}
                  />
                </div>

                <div className="flex gap-8 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={isFeatured} onCheckedChange={setIsFeatured} /><Label>Featured</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={isTrending} onCheckedChange={setIsTrending} /><Label>Trending</Label></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6 animate-in fade-in-50 duration-300">
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Staged Product Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex gap-4 flex-wrap">
                  {stagedImages.map((img) => (
                    <div key={img.id} className="relative group w-32 h-32">
                      <img src={img.previewUrl} alt="Staged" className="w-full h-full object-cover rounded-xl border-2 border-transparent group-hover:border-primary transition-all cursor-pointer" onClick={() => setPreviewImageUrl(img.previewUrl)} />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeStagedImage(img.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                        <span className="bg-primary text-[10px] text-white px-2 py-0.5 rounded-full shadow-sm">{img.linkedVariantTempIds.length} Linked</span>
                      </div>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:bg-muted/50 hover:border-primary transition-all">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-[10px] font-medium mt-2 text-muted-foreground uppercase tracking-wider">Add Media</span>
                    <input ref={productImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleAddStagedImages(e.target.files)} />
                  </label>
                </div>

                {stagedImages.length > 0 && variants.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-lg">Link Media to Variants</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {stagedImages.map((img) => (
                        <div key={img.id} className="bg-muted/20 p-4 rounded-xl space-y-4">
                          <img src={img.previewUrl} className="w-full aspect-square object-cover rounded-lg shadow-sm" />
                          <div className="space-y-2">
                             <div className="flex flex-wrap gap-1.5">
                              {variants.map((v, vIdx) => {
                                const vKey = `idx-${vIdx}`;
                                const isLinked = img.linkedVariantTempIds.includes(vKey);
                                return (
                                  <button key={vKey} type="button" onClick={() => toggleImageVariantLink(img.id, vIdx)} className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${isLinked ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary"}`}>
                                    {v.nameEn || `Variant ${vIdx + 1}`}
                                  </button>
                                );
                              })}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-8 animate-in fade-in-50 duration-300">
            <ProductOptionsManager options={options} onChange={setOptions} />
            <VariantMatrix variants={variants} options={options} onChange={setVariants} onUploadRequest={() => toast.info("Upload in Media tab")} productImagesCount={0} />
          </TabsContent>

          <TabsContent value="custom" className="space-y-6 animate-in fade-in-50 duration-300">
            <CustomFieldsManager fields={customFields} onChange={setCustomFields} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 animate-in fade-in-50 duration-300">
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader><CardTitle>Search Engine Optimization</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Meta Title (English)</Label><Input value={metaTitleEn} onChange={(e) => setMetaTitleEn(e.target.value)} className="h-11" /></div>
                  <div className="space-y-2"><Label>Meta Title (Arabic)</Label><Input value={metaTitleAr} onChange={(e) => setMetaTitleAr(e.target.value)} dir="rtl" className="h-11" /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Meta Description (English)</Label><Textarea value={metaDescriptionEn} onChange={(e) => setMetaDescriptionEn(e.target.value)} rows={3} /></div>
                  <div className="space-y-2"><Label>Meta Description (Arabic)</Label><Textarea value={metaDescriptionAr} onChange={(e) => setMetaDescriptionAr(e.target.value)} dir="rtl" rows={3} /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-12 bg-card/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border sticky bottom-4 z-50">
          <Button type="button" variant="outline" size="lg" asChild className="px-8 rounded-xl h-12">
            <Link to="/products">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting} className="px-10 rounded-xl h-12 font-semibold shadow-lg shadow-primary/20">
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSubmitting ? "Generating Product..." : "Create Product"}
          </Button>
        </div>
      </form>

      <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          {previewImageUrl && <img src={previewImageUrl} alt="Preview" className="w-full h-auto object-contain rounded-2xl shadow-2xl" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

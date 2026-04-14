import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useAllCollections } from "@/features/collections";
import {
  useProduct,
  useUpdateProduct,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  useProductImages,
  useUploadProductImages,
  useDeleteProductImage,
  useLinkImageToVariant,
  useUnlinkImageFromVariant,
} from "@/features/products";
import type { UpdateProductBody, CreateVariantBody, UpdateVariantBody } from "@/features/products";
import { ProductOptionsManager, type ProductOptionForm } from "@/features/products/components/ProductOptionsManager";
import { VariantMatrix } from "@/features/products/components/VariantMatrix";
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

interface VariantForm {
  id?: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  isActive: boolean;
  isNew?: boolean;
  optionValueIds?: string[];
}

export function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: productRes, isLoading } = useProduct(slug ?? "");
  const product = productRes?.data;

  const updateProductMutation = useUpdateProduct();
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();
  const uploadProductImagesMutation = useUploadProductImages();
  const deleteProductImageMutation = useDeleteProductImage();
  const linkImageMutation = useLinkImageToVariant();
  const unlinkImageMutation = useUnlinkImageFromVariant();

  const { data: productImages } = useProductImages(product?.id ?? "");

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [linkImageVariantId, setLinkImageVariantId] = useState<string | null>(null);

  const { data: collectionsRes } = useAllCollections();

  const collections = collectionsRes?.data ?? [];

  const [isInitialized, setIsInitialized] = useState(false);
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
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [originalVariantIds, setOriginalVariantIds] = useState<string[]>([]);
  const [options, setOptions] = useState<ProductOptionForm[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldForm[]>([]);

  useEffect(() => {
    if (product && !isInitialized) {
      setNameEn(product.nameEn);
      setNameAr(product.nameAr);
      setDescriptionEn(product.descriptionEn);
      setDescriptionAr(product.descriptionAr);
      setShortDescriptionEn(product.shortDescriptionEn ?? "");
      setShortDescriptionAr(product.shortDescriptionAr ?? "");
      setMetaTitleEn(product.metaTitleEn ?? "");
      setMetaTitleAr(product.metaTitleAr ?? "");
      setMetaDescriptionEn(product.metaDescriptionEn ?? "");
      setMetaDescriptionAr(product.metaDescriptionAr ?? "");
      setCollectionId(product.collectionId ?? "");
      setIsActive(product.isActive);
      setIsFeatured(product.isFeatured);
      setIsTrending(product.isTrending ?? false);
      setBadge((product as any).badge ?? "");
      setPosition(product.position ?? 0);
      setBaseCategory((product as any).baseCategory ?? "");
      const attrs = (product as any).fashionAttributes;
      if (attrs) {
        setFashionAttributes({
          fabric: attrs.fabric ?? "",
          embellishment: attrs.embellishment ?? "NONE",
          sleeveStyle: attrs.sleeveStyle ?? "",
          fitType: attrs.fitType ?? "",
          transparencyLayer: attrs.transparencyLayer ?? "",
          neckline: attrs.neckline ?? null,
          length: attrs.length ?? null,
        });
      }
      const occ = (product as any).occasions ?? [];
      setOccasionIds(occ.map((o: any) => o.occasionId));
      const occPos: Record<string, number> = {};
      occ.forEach((o: any) => { occPos[o.occasionId] = o.position; });
      setOccasionPositions(occPos);
      const productVariants = (product as any).variants;
      setVariants(
        productVariants.map((v: any) => ({
          id: v.id,
          nameEn: v.nameEn,
          nameAr: v.nameAr,
          sku: v.sku ?? "",
          price: String(v.price),
          compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : "",
          stock: String(v.stock),
          isActive: v.isActive,
          optionValueIds: (v as any).optionValues?.map((ov: any) => ov.id) ?? [],
        }))
      );
      setOriginalVariantIds(productVariants.map((v: any) => v.id));
      setOptions(
        (product as any).options?.map((opt: any) => ({
          id: opt.id,
          nameEn: opt.nameEn,
          nameAr: opt.nameAr,
          position: opt.position,
          values: opt.values.map((v: any) => ({
            id: v.id,
            valueEn: v.valueEn,
            valueAr: v.valueAr,
            hex: v.hex,
            position: v.position,
          })),
        })) ?? []
      );
      setCustomFields(
        (product as any).customFields?.map((f: any) => ({
          id: f.id,
          type: f.type,
          labelEn: f.labelEn,
          labelAr: f.labelAr,
          placeholderEn: f.placeholderEn ?? "",
          placeholderAr: f.placeholderAr ?? "",
          isRequired: f.isRequired,
        })) ?? []
      );
      setIsInitialized(true);
    }
  }, [product, isInitialized]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const productBody: UpdateProductBody = {
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
        collectionId: collectionId || undefined,
        isActive,
        isFeatured,
        isTrending,
        badge: badge || undefined,
        position,
        baseCategory: baseCategory || undefined,
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
        }))
      };

      await updateProductMutation.mutateAsync({ id: product.id, body: productBody });

      // Delete variants that were removed
      const currentVariantIds = variants.filter(v => v.id).map(v => v.id!);
      const deletedVariantIds = originalVariantIds.filter(id => !currentVariantIds.includes(id));
      for (const variantId of deletedVariantIds) {
        await deleteVariantMutation.mutateAsync(variantId);
      }

      for (const variant of variants) {
        if (variant.isNew) {
          const body: CreateVariantBody = {
            nameEn: variant.nameEn,
            nameAr: variant.nameAr,
            sku: variant.sku || undefined,
            price: parseFloat(variant.price) || 0,
            compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
            stock: parseInt(variant.stock) || 0,
            isActive: variant.isActive,
            optionValueIds: variant.optionValueIds,
          };
          await createVariantMutation.mutateAsync({ productId: product.id, body });
        } else if (variant.id) {
          const body: UpdateVariantBody = {
            nameEn: variant.nameEn,
            nameAr: variant.nameAr,
            sku: variant.sku || undefined,
            price: parseFloat(variant.price) || 0,
            compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
            stock: parseInt(variant.stock) || 0,
            isActive: variant.isActive,
            optionValueIds: variant.optionValueIds,
          };
          await updateVariantMutation.mutateAsync({ variantId: variant.id, body });
        }
      }

      // Invalidate queries once after all mutations complete
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Product updated");
      navigate("/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  if (isLoading || (product && !isInitialized)) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Button asChild className="mt-4">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const isSaving =
    updateProductMutation.isPending ||
    createVariantMutation.isPending ||
    updateVariantMutation.isPending;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">{product.nameEn}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Media</TabsTrigger>
            <TabsTrigger value="options">Options & Variants</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English) *</Label>
                    <Input
                      id="nameEn"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">Name (Arabic) *</Label>
                    <Input
                      id="nameAr"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      dir="rtl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">Description (English)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea
                      id="descriptionAr"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      dir="rtl"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortDescriptionEn">Short Description (English)</Label>
                    <Textarea
                      id="shortDescriptionEn"
                      value={shortDescriptionEn}
                      onChange={(e) => setShortDescriptionEn(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescriptionAr">Short Description (Arabic)</Label>
                    <Textarea
                      id="shortDescriptionAr"
                      value={shortDescriptionAr}
                      onChange={(e) => setShortDescriptionAr(e.target.value)}
                      dir="rtl"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Collection</Label>
                    <Select
                      value={collectionId || "none"}
                      onValueChange={(v) => setCollectionId(v === "none" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Collection</SelectItem>
                        {collections
                          .filter((c: any) => !c.parentId)
                          .map((parent: any) => {
                            const children = collections.filter((c: any) => c.parentId === parent.id);
                            return (
                              <div key={parent.id}>
                                <SelectItem value={parent.id} className="font-medium">
                                  {parent.nameEn}
                                </SelectItem>
                                {children.map((child: any) => (
                                  <SelectItem key={child.id} value={child.id} className="pl-6 text-muted-foreground">
                                    └ {child.nameEn}
                                  </SelectItem>
                                ))}
                              </div>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="isTrending" checked={isTrending} onCheckedChange={setIsTrending} />
                    <Label htmlFor="isTrending">Trending</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Display Position</Label>
                    <Input
                      id="position"
                      type="number"
                      min="0"
                      value={position}
                      onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Badge</Label>
                    <Select
                      value={badge || "none"}
                      onValueChange={(v) => setBadge(v === "none" ? "" : v as ProductBadge)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Badge</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="BESTSELLER">Bestseller</SelectItem>
                        <SelectItem value="LIMITED_EDITION">Limited Edition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fashion Domain Fields */}
                <div className="border-t pt-4 mt-4 space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Product Images</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Upload images once, link to multiple variants
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload new images */}
                <div className="space-y-2">
                  <Label>Upload New Images</Label>
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            try {
                              await uploadProductImagesMutation.mutateAsync({
                                productId: product.id,
                                files: Array.from(e.target.files),
                              });
                              toast.success("Images uploaded");
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed to upload");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Product images gallery */}
                <div className="space-y-4">
                  <Label>All Product Images ({productImages?.data?.length ?? 0})</Label>
                  {productImages?.data && productImages.data.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {productImages.data.map((img) => (
                        <div key={img.id} className="border rounded-lg p-3 space-y-3">
                          <div className="relative group">
                            <img
                              src={img.url}
                              alt={img.altEn || "Product image"}
                              className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                              onClick={() => setPreviewImageUrl(img.url)}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={async () => {
                                if (!confirm("Delete this image from all variants?")) return;
                                try {
                                  await deleteProductImageMutation.mutateAsync(img.id);
                                  toast.success("Image deleted");
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Failed to delete");
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Linked variants */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Linked to {img.variantImages?.length ?? 0} variant(s)
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.variants.map((variant, idx) => {
                                const isLinked = img.variantImages?.some(
                                  (vi) => vi.variantId === variant.id
                                );
                                return (
                                  <button
                                    key={variant.id}
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        if (isLinked) {
                                          await unlinkImageMutation.mutateAsync({
                                            imageId: img.id,
                                            variantId: variant.id,
                                          });
                                          toast.success("Image unlinked");
                                        } else {
                                          await linkImageMutation.mutateAsync({
                                            imageId: img.id,
                                            variantId: variant.id,
                                          });
                                          toast.success("Image linked");
                                        }
                                      } catch (err) {
                                        toast.error(err instanceof Error ? err.message : "Failed");
                                      }
                                    }}
                                    className={`text-xs px-2 py-1 rounded-full border transition ${isLinked
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-muted/50 border-border hover:border-primary"
                                      }`}
                                  >
                                    {variant.nameEn ?? `Variant ${idx + 1}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No images uploaded yet. Upload images above to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options" className="space-y-6">
            <ProductOptionsManager
              options={options}
              onChange={setOptions}
            />
            <VariantMatrix
              variants={variants}
              options={options}
              onChange={setVariants}
              productImagesCount={productImages?.data?.length ?? 0}
              onUploadRequest={(id) => {
                setLinkImageVariantId(id);
              }}
            />
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <CustomFieldsManager
              fields={customFields}
              onChange={setCustomFields}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleEn">Meta Title (English)</Label>
                    <Input
                      id="metaTitleEn"
                      value={metaTitleEn}
                      onChange={(e) => setMetaTitleEn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleAr">Meta Title (Arabic)</Label>
                    <Input
                      id="metaTitleAr"
                      value={metaTitleAr}
                      onChange={(e) => setMetaTitleAr(e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionEn">Meta Description (English)</Label>
                    <Textarea
                      id="metaDescriptionEn"
                      value={metaDescriptionEn}
                      onChange={(e) => setMetaDescriptionEn(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionAr">Meta Description (Arabic)</Label>
                    <Textarea
                      id="metaDescriptionAr"
                      value={metaDescriptionAr}
                      onChange={(e) => setMetaDescriptionAr(e.target.value)}
                      dir="rtl"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link to="/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>

      <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Link existing images to variant modal */}
      <Dialog open={!!linkImageVariantId} onOpenChange={() => setLinkImageVariantId(null)}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Link Images to Variant</h3>
              <p className="text-sm text-muted-foreground">
                Select images from the product gallery to link to this variant
              </p>
            </div>

            {productImages?.data && productImages.data.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {productImages.data.map((img) => {
                  const isLinked = img.variantImages?.some(
                    (vi) => vi.variantId === linkImageVariantId
                  );
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={async () => {
                        if (!linkImageVariantId) return;
                        try {
                          if (isLinked) {
                            await unlinkImageMutation.mutateAsync({
                              imageId: img.id,
                              variantId: linkImageVariantId,
                            });
                            toast.success("Image unlinked");
                          } else {
                            await linkImageMutation.mutateAsync({
                              imageId: img.id,
                              variantId: linkImageVariantId,
                            });
                            toast.success("Image linked");
                          }
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed");
                        }
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${isLinked
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={img.altEn || "Product image"}
                        className="w-full h-full object-cover"
                      />
                      {isLinked && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <X className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No product images available.</p>
                <p className="text-sm">Go to the Images tab to upload images first.</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => setLinkImageVariantId(null)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Trash2, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProductOptionForm } from "./ProductOptionsManager";

export interface VariantForm {
  id?: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  isActive: boolean;
  isNew?: boolean;
  optionValueIds?: string[]; // IDs of selected option values
}

interface Props {
  variants: VariantForm[];
  options: ProductOptionForm[];
  onChange: (variants: VariantForm[]) => void;
  onUploadRequest: (variantId: string) => void;
  productImagesCount: number;
}

export function VariantMatrix({ variants, options, onChange, onUploadRequest }: Props) {

  const generateCartesian = (params: any[][]) => {
    return params.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
  };

  const syncFromOptions = () => {
    if (options.length === 0) return;

    // Check if all options have at least one value
    if (options.some(opt => opt.values.length === 0)) {
      alert("All options must have at least one value.");
      return;
    }

    const valueCombinations = generateCartesian(options.map(opt => opt.values));

    const newVariants: VariantForm[] = valueCombinations.map((combo: any[]) => {
      const namesEn = combo.map(v => v.valueEn).join(" / ");
      const namesAr = combo.map(v => v.valueAr).join(" / ");

      // Try to find if this variant already exists based on optionValueIds
      // We don't have stable IDs for new values, so we might match by name for now
      // Or just assume the user is okay with re-generating

      return {
        nameEn: namesEn,
        nameAr: namesAr,
        sku: "",
        price: "0",
        compareAtPrice: "",
        stock: "0",
        isActive: true,
        isNew: true,
        // In a real app, these values would have temporary IDs
        // For now we'll rely on the backend to link them if we pass the names
        // But the schema expects IDs. We'll handle ID-less linking in the service.
      };
    });

    if (confirm(`This will propose ${newVariants.length} variants. Proceed?`)) {
      onChange([...variants, ...newVariants]);
    }
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Variant Matrix</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={syncFromOptions}>
            <RefreshCw className="h-4 w-4 mr-2" /> Generate from Options
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...variants, {
            nameEn: "", nameAr: "", sku: "", price: "0", compareAtPrice: "", stock: "0", isActive: true, isNew: true
          }])}>
            Add Manual Variant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Variant / Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="space-y-1">
                    <Input
                      value={v.nameEn}
                      onChange={(e) => updateVariant(idx, "nameEn", e.target.value)}
                      placeholder="e.g. Small / 52"
                    />
                    <Input
                      value={v.nameAr}
                      onChange={(e) => updateVariant(idx, "nameAr", e.target.value)}
                      placeholder="صغير / ٥٢"
                      dir="rtl"
                      className="text-xs h-8"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={v.sku}
                    onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                    className="w-[120px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={v.price}
                    onChange={(e) => updateVariant(idx, "price", e.target.value)}
                    className="w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                    className="w-[80px]"
                  />
                </TableCell>
                <TableCell>
                  {v.id ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onUploadRequest(v.id!)}>
                      <LinkIcon className="h-3 w-3 mr-1" /> Images
                    </Button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase">Save first</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={v.isActive}
                    onCheckedChange={(val) => updateVariant(idx, "isActive", val)}
                  />
                </TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {variants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No variants found. Use the buttons above to create them.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProductOptionForm {
  id?: string;
  nameEn: string;
  nameAr: string;
  position: number;
  values: Array<{
    id?: string;
    valueEn: string;
    valueAr: string;
    hex?: string;
    position: number;
  }>;
}

interface Props {
  options: ProductOptionForm[];
  onChange: (options: ProductOptionForm[]) => void;
}

export function ProductOptionsManager({ options, onChange }: Props) {
  const addOption = () => {
    onChange([
      ...options,
      {
        nameEn: "",
        nameAr: "",
        position: options.length,
        values: [{ valueEn: "", valueAr: "", hex: undefined, position: 0 }],
      },
    ]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof ProductOptionForm, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  const addValue = (optIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values.push({
      valueEn: "",
      valueAr: "",
      hex: undefined,
      position: newOptions[optIndex].values.length,
    });
    onChange(newOptions);
  };

  const removeValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex);
    onChange(newOptions);
  };

  const updateValue = (optIndex: number, valIndex: number, field: string, value: string) => {
    const newOptions = [...options];
    const val = newOptions[optIndex].values[valIndex];
    (val as any)[field] = value;
    onChange(newOptions);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Options</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No options defined. Add "Size" or "Length" to create variations.
          </p>
        )}

        {options.map((option, optIdx) => (
          <div key={optIdx} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-2">
                  <Label>Option Name (EN) - e.g. Size</Label>
                  <Input
                    value={option.nameEn}
                    onChange={(e) => updateOption(optIdx, "nameEn", e.target.value)}
                    placeholder="Size"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option Name (AR)</Label>
                  <Input
                    value={option.nameAr}
                    onChange={(e) => updateOption(optIdx, "nameAr", e.target.value)}
                    placeholder="المقاس"
                    dir="rtl"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-8 text-destructive"
                onClick={() => removeOption(optIdx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 pl-4 border-l-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Values</Label>
              {option.values.map((val, valIdx) => (
                <div key={valIdx} className="flex items-center gap-3">
                  <Input
                    size={32}
                    placeholder="S, M, L..."
                    value={val.valueEn}
                    onChange={(e) => updateValue(optIdx, valIdx, "valueEn", e.target.value)}
                  />
                  <Input
                    size={32}
                    placeholder="ص، م، ل..."
                    value={val.valueAr}
                    onChange={(e) => updateValue(optIdx, valIdx, "valueAr", e.target.value)}
                    dir="rtl"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="color"
                      value={val.hex || "#000000"}
                      onChange={(e) => updateValue(optIdx, valIdx, "hex", e.target.value)}
                      className="w-8 h-8 p-0 border cursor-pointer"
                      title="Color hex value"
                    />
                    <Input
                      size={8}
                      placeholder="#000"
                      value={val.hex || ""}
                      onChange={(e) => updateValue(optIdx, valIdx, "hex", e.target.value)}
                      className="w-20 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={option.values.length <= 1}
                    onClick={() => removeValue(optIdx, valIdx)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary h-8"
                onClick={() => addValue(optIdx)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Value
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

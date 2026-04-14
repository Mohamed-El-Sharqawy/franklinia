import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CustomFieldForm {
  id?: string;
  type: "TEXT" | "TEXTAREA" | "NUMBER" | "FILE";
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  isRequired: boolean;
}

interface Props {
  fields: CustomFieldForm[];
  onChange: (fields: CustomFieldForm[]) => void;
}

export function CustomFieldsManager({ fields, onChange }: Props) {
  const addField = () => {
    onChange([
      ...fields,
      {
        type: "TEXT",
        labelEn: "",
        labelAr: "",
        placeholderEn: "",
        placeholderAr: "",
        isRequired: false,
      },
    ]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: keyof CustomFieldForm, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [field]: value };
    onChange(newFields);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Tailoring Fields</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          <Plus className="h-4 w-4 mr-2" /> Add Field
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No custom fields defined. Add fields for "Special Measurements" or "Custom Notes".
          </p>
        )}

        {fields.map((field, idx) => (
          <div key={idx} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(v) => updateField(idx, "type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Short Text</SelectItem>
                      <SelectItem value="TEXTAREA">Long Text (Textarea)</SelectItem>
                      <SelectItem value="NUMBER">Number Only</SelectItem>
                      <SelectItem value="FILE">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2 pt-8">
                        <Switch
                            id={`req-${idx}`}
                            checked={field.isRequired}
                            onCheckedChange={(val) => updateField(idx, "isRequired", val)}
                        />
                        <Label htmlFor={`req-${idx}`}>Required field</Label>
                    </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive mt-1"
                onClick={() => removeField(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label (EN)</Label>
                <Input
                  value={field.labelEn}
                  onChange={(e) => updateField(idx, "labelEn", e.target.value)}
                  placeholder="e.g. Length in inches"
                />
              </div>
              <div className="space-y-2">
                <Label>Label (AR)</Label>
                <Input
                  value={field.labelAr}
                  onChange={(e) => updateField(idx, "labelAr", e.target.value)}
                  placeholder="الاسم بالعربي"
                  dir="rtl"
                />
              </div>
            </div>

            {field.type !== "FILE" && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Placeholder (EN) - optional</Label>
                        <Input
                            value={field.placeholderEn}
                            onChange={(e) => updateField(idx, "placeholderEn", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Placeholder (AR) - optional</Label>
                        <Input
                            value={field.placeholderAr}
                            onChange={(e) => updateField(idx, "placeholderAr", e.target.value)}
                            dir="rtl"
                        />
                    </div>
                </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

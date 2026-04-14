import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  fabricLabels,
  embellishmentLabels,
  sleeveStyleLabels,
  fitTypeLabels,
  transparencyLayerLabels,
  necklineLabels,
  garmentLengthLabels,
} from "@ecommerce/shared-utils";

export interface FashionAttributesInput {
  fabric: string;
  embellishment: string;
  sleeveStyle: string;
  fitType: string;
  transparencyLayer: string;
  neckline: string | null;
  length: string | null;
}

interface FashionAttributesFormProps {
  value: FashionAttributesInput;
  onChange: (value: FashionAttributesInput) => void;
  errors?: Record<string, string>;
}

type FieldKey = keyof FashionAttributesInput;

interface FieldConfig {
  key: FieldKey;
  label: string;
  required: boolean;
  options: Record<string, { en: string; ar: string }>;
}

const FIELDS: FieldConfig[] = [
  { key: "fabric", label: "Fabric", required: true, options: fabricLabels },
  { key: "embellishment", label: "Embellishment", required: true, options: embellishmentLabels },
  { key: "sleeveStyle", label: "Sleeve Style", required: true, options: sleeveStyleLabels },
  { key: "fitType", label: "Fit Type", required: true, options: fitTypeLabels },
  { key: "transparencyLayer", label: "Transparency Layer", required: true, options: transparencyLayerLabels },
  { key: "neckline", label: "Neckline", required: false, options: necklineLabels },
  { key: "length", label: "Length", required: false, options: garmentLengthLabels },
];

export function FashionAttributesForm({ value, onChange, errors }: FashionAttributesFormProps) {
  const handleChange = (key: FieldKey, val: string) => {
    onChange({ ...value, [key]: val || null });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {FIELDS.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={value[field.key] ?? ""}
            onValueChange={(v) => handleChange(field.key, v)}
          >
            <SelectTrigger id={field.key} className="w-full">
              <SelectValue placeholder={field.required ? `Select ${field.label}` : "Optional"} />
            </SelectTrigger>
            <SelectContent>
              {!field.required && (
                <SelectItem value="__none__">— None —</SelectItem>
              )}
              {Object.entries(field.options).map(([enumVal, labels]) => (
                <SelectItem key={enumVal} value={enumVal}>
                  {labels.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.[field.key] && (
            <p className="text-sm text-destructive">{errors[field.key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

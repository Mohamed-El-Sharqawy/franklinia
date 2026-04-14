import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BaseCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const OPTIONS = [
  { value: "ABAYA", label: "Abaya" },
  { value: "MODEST_DRESS", label: "Modest Dress" },
];

export function BaseCategorySelect({ value, onChange, error }: BaseCategorySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="baseCategory">Base Category</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="baseCategory" className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

import { useOccasions } from "../../occasions/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, X } from "lucide-react";

interface OccasionSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[], positions: Record<string, number>) => void;
  error?: string;
}

export function OccasionSelector({ selectedIds, onChange, error }: OccasionSelectorProps) {
  const { data } = useOccasions({ isActive: "true" });
  const occasions = data?.data ?? [];

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((sid) => sid !== id);
      const nextPositions = next.reduce<Record<string, number>>(
        (acc, sid, i) => ({ ...acc, [sid]: i }),
        {}
      );
      onChange(next, nextPositions);
    } else {
      const next = [...selectedIds, id];
      const nextPositions = next.reduce<Record<string, number>>(
        (acc, sid, i) => ({ ...acc, [sid]: i }),
        {}
      );
      onChange(next, nextPositions);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedIds];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    const nextPositions = next.reduce<Record<string, number>>(
      (acc, sid, i) => ({ ...acc, [sid]: i }),
      {}
    );
    onChange(next, nextPositions);
  };

  const moveDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    const next = [...selectedIds];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    const nextPositions = next.reduce<Record<string, number>>(
      (acc, sid, i) => ({ ...acc, [sid]: i }),
      {}
    );
    onChange(next, nextPositions);
  };

  const selectedOccasions = selectedIds
    .map((id) => occasions.find((o) => o.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Occasions
        <span className="text-destructive ml-1">*</span>
      </label>

      {/* Selected occasions with reorder */}
      {selectedOccasions.length > 0 && (
        <div className="space-y-1">
          {selectedOccasions.map((occasion, index) =>
            occasion ? (
              <div
                key={occasion.id}
                className="flex items-center gap-2 rounded-md border px-3 py-1.5"
              >
                <span className="flex-1 text-sm">{occasion.nameEn}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveDown(index)}
                  disabled={index === selectedIds.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggle(occasion.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Available occasions to add */}
      <div className="flex flex-wrap gap-2">
        {occasions
          .filter((o) => !selectedIds.includes(o.id))
          .map((occasion) => (
            <Badge
              key={occasion.id}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => toggle(occasion.id)}
            >
              {occasion.nameEn}
            </Badge>
          ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

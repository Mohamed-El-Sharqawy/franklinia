import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  useOccasions,
  useCreateOccasion,
  useUpdateOccasion,
  useDeleteOccasion,
} from "@/features/occasions";
import type { Occasion } from "@/features/occasions/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function OccasionsPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);

  const { data: response, isLoading } = useOccasions();
  const createMutation = useCreateOccasion();
  const updateMutation = useUpdateOccasion();
  const deleteMutation = useDeleteOccasion();

  const occasions = response?.data ?? [];
  const filteredOccasions = occasions.filter(
    (o) =>
      o.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      o.nameAr.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingOccasion(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (occasion: Occasion) => {
    setEditingOccasion(occasion);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingOccasion(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const body = {
      slug: (formData.get("nameEn") as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nameEn: formData.get("nameEn") as string,
      nameAr: formData.get("nameAr") as string,
      descriptionEn: formData.get("descriptionEn") as string || undefined,
      descriptionAr: formData.get("descriptionAr") as string || undefined,
      position: parseFloat(formData.get("position") as string) || 0,
      isActive: formData.get("isActive") === "on",
    };

    try {
      if (editingOccasion) {
        await updateMutation.mutateAsync({ id: editingOccasion.id, body });
        toast.success("Occasion updated");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Occasion created");
      }
      closeDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save occasion");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this occasion?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Occasion deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete occasion");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Occasions</h1>
          <p className="text-muted-foreground">Manage product occasions and tags.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Occasion
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search occasions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Pos</TableHead>
              <TableHead>English Name</TableHead>
              <TableHead>Arabic Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : filteredOccasions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No occasions found.
                </TableCell>
              </TableRow>
            ) : (
              // Order by position primarily
              [...filteredOccasions]
                .sort((a, b) => a.position - b.position)
                .map((occasion) => (
                  <TableRow key={occasion.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {occasion.position}
                    </TableCell>
                    <TableCell className="font-medium">{occasion.nameEn}</TableCell>
                    <TableCell dir="rtl">{occasion.nameAr}</TableCell>
                    <TableCell>
                      {occasion.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {occasion._count?.products || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(occasion)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(occasion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingOccasion ? "Edit Occasion" : "Create Occasion"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nameEn">English Name *</Label>
                  <Input
                    id="nameEn"
                    name="nameEn"
                    defaultValue={editingOccasion?.nameEn ?? ""}
                    required
                  />
                </div>
                <div className="grid gap-2 text-right">
                  <Label htmlFor="nameAr">Arabic Name *</Label>
                  <Input
                    id="nameAr"
                    name="nameAr"
                    dir="rtl"
                    defaultValue={editingOccasion?.nameAr ?? ""}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descriptionEn">English Description</Label>
                <Textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  defaultValue={editingOccasion?.descriptionEn ?? ""}
                  rows={2}
                />
              </div>

              <div className="grid gap-2 text-right">
                <Label htmlFor="descriptionAr">Arabic Description</Label>
                <Textarea
                  id="descriptionAr"
                  name="descriptionAr"
                  dir="rtl"
                  defaultValue={editingOccasion?.descriptionAr ?? ""}
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  type="number"
                  min="0"
                  defaultValue={editingOccasion?.position ?? 0}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingOccasion?.isActive ?? true}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingOccasion ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Plus, Loader2, Edit2, Trash2, Shield, Layout } from "lucide-react";
import {
  usePages, useDeletePage, useCreatePage, useUpdatePage,
  usePolicies, useDeletePolicy, useCreatePolicy, useUpdatePolicy
} from "@/features/static-page";
import type { Page, Policy } from "@ecommerce/shared-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export function StaticPagesPage() {
  const [activeTab, setActiveTab] = useState<"pages" | "policies">("pages");
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  // Queries
  const { data: pagesRes, isLoading: isPagesLoading } = usePages();
  const { data: policiesRes, isLoading: isPoliciesLoading } = usePolicies();

  const pages = pagesRes?.data ?? [];
  const policies = policiesRes?.data ?? [];

  // Mutations
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  const createPolicy = useCreatePolicy();
  const updatePolicy = useUpdatePolicy();
  const deletePolicy = useDeletePolicy();

  const handleSavePage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      slug: formData.get("slug") as string,
      titleEn: formData.get("titleEn") as string,
      titleAr: formData.get("titleAr") as string,
      contentEn: formData.get("contentEn") as string,
      contentAr: formData.get("contentAr") as string,
      isActive: formData.get("isActive") === "on",
    };

    try {
      if (editingPage) {
        await updatePage.mutateAsync({ id: editingPage.id, body });
        toast.success("Page updated");
      } else {
        await createPage.mutateAsync(body);
        toast.success("Page created");
      }
      setIsPageDialogOpen(false);
      setEditingPage(null);
    } catch (err) {
      toast.error("Failed to save page");
    }
  };

  const handleSavePolicy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      slug: formData.get("slug") as string,
      titleEn: formData.get("titleEn") as string,
      titleAr: formData.get("titleAr") as string,
      contentEn: formData.get("contentEn") as string,
      contentAr: formData.get("contentAr") as string,
      isActive: formData.get("isActive") === "on",
    };

    try {
      if (editingPolicy) {
        await updatePolicy.mutateAsync({ id: editingPolicy.id, body });
        toast.success("Policy updated");
      } else {
        await createPolicy.mutateAsync(body);
        toast.success("Policy created");
      }
      setIsPolicyDialogOpen(false);
      setEditingPolicy(null);
    } catch (err) {
      toast.error("Failed to save policy");
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deletePage.mutateAsync(id);
      toast.success("Page deleted");
    } catch (err) {
      toast.error("Failed to delete page");
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deletePolicy.mutateAsync(id);
      toast.success("Policy deleted");
    } catch (err) {
      toast.error("Failed to delete policy");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Manage dynamic pages and legal policies.</p>
        </div>
        <Button onClick={() => activeTab === "pages" ? setIsPageDialogOpen(true) : setIsPolicyDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add {activeTab === "pages" ? "Page" : "Policy"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pages">
            <Layout className="h-4 w-4 mr-2" /> Pages
          </TabsTrigger>
          <TabsTrigger value="policies">
            <Shield className="h-4 w-4 mr-2" /> Policies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="border rounded-lg mt-4">
          {isPagesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.titleEn} / {p.titleAr}</TableCell>
                    <TableCell><code>/{p.slug}</code></TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPage(p); setIsPageDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePage(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="policies" className="border rounded-lg mt-4">
          {isPoliciesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.titleEn}</TableCell>
                    <TableCell><code>/policy/{p.slug}</code></TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPolicy(p); setIsPolicyDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePolicy(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Page Dialog */}
      <Dialog open={isPageDialogOpen} onOpenChange={(open) => { setIsPageDialogOpen(open); if (!open) setEditingPage(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{editingPage ? "Edit Page" : "New Page"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSavePage} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (EN)</Label>
                <Input id="titleEn" name="titleEn" defaultValue={editingPage?.titleEn} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleAr">Title (AR)</Label>
                <Input id="titleAr" name="titleAr" defaultValue={editingPage?.titleAr} dir="rtl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={editingPage?.slug} placeholder="about-us" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentEn">Content (EN)</Label>
                <Textarea id="contentEn" name="contentEn" defaultValue={editingPage?.contentEn} rows={10} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentAr">Content (AR)</Label>
                <Textarea id="contentAr" name="contentAr" defaultValue={editingPage?.contentAr} dir="rtl" rows={10} required />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" name="isActive" defaultChecked={editingPage?.isActive ?? true} />
              <Label htmlFor="isActive">Active / Published</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createPage.isPending || updatePage.isPending}>Save Page</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog open={isPolicyDialogOpen} onOpenChange={(open) => { setIsPolicyDialogOpen(open); if (!open) setEditingPolicy(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{editingPolicy ? "Edit Policy" : "New Policy"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSavePolicy} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (EN)</Label>
                <Input id="titleEn" name="titleEn" defaultValue={editingPolicy?.titleEn} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleAr">Title (AR)</Label>
                <Input id="titleAr" name="titleAr" defaultValue={editingPolicy?.titleAr} dir="rtl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={editingPolicy?.slug} placeholder="privacy-policy" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentEn">Content (EN)</Label>
                <Textarea id="contentEn" name="contentEn" defaultValue={editingPolicy?.contentEn} rows={10} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentAr">Content (AR)</Label>
                <Textarea id="contentAr" name="contentAr" defaultValue={editingPolicy?.contentAr} dir="rtl" rows={10} required />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" name="isActive" defaultChecked={editingPolicy?.isActive ?? true} />
              <Label htmlFor="isActive">Active / Published</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createPolicy.isPending || updatePolicy.isPending}>Save Policy</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Search, Loader2, Eye, Trash2, Check } from "lucide-react";
import { useFormSubmissions, useUpdateFormSubmissionStatus, useDeleteFormSubmission } from "@/features/form-submission";
import type { FormSubmission } from "@ecommerce/shared-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export function InquiriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<FormSubmission | null>(null);

  const { data: inquiriesRes, isLoading } = useFormSubmissions();
  const inquiries = inquiriesRes?.data?.data ?? [];

  const updateStatus = useUpdateFormSubmissionStatus();
  const deleteInquiry = useDeleteFormSubmission();

  const handleUpdateStatus = async (id: string, status: any, adminNotes: string) => {
    try {
      await updateStatus.mutateAsync({ id, body: { status, adminNotes } });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry.mutateAsync(id);
      toast.success("Inquiry deleted");
    } catch {
      toast.error("Failed to delete inquiry");
    }
  };

  const filteredInquiries = inquiries.filter((inq: any) => {
    if (statusFilter !== "all" && inq.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    const payload = JSON.stringify(inq.payload).toLowerCase();
    return payload.includes(s) || inq.type.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>
        <p className="text-muted-foreground">Manage contact forms, custom orders, and newsletter signups.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="SPAM">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Customer / Payload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inq: any) => (
                <TableRow key={inq.id}>
                  <TableCell>
                    <Badge variant="outline">{inq.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{inq.payload.name || inq.payload.email || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {inq.payload.message || inq.payload.message_en || "No message content"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      inq.status === "RESOLVED" ? "default" :
                        inq.status === "PENDING" ? "outline" : "secondary"
                    }>
                      {inq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedInquiry(inq)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(inq.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Inquiry Details</DialogTitle></DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Metadata</Label>
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2"><Check className="h-3 w-3" /> Type: {selectedInquiry.type}</p>
                    <p className="text-sm font-medium flex items-center gap-2"> Status: {selectedInquiry.status}</p>
                    <p className="text-sm text-muted-foreground">Received: {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                  </div>
                </Card>
                <div className="space-y-4">
                  <Label>Update Status</Label>
                  <Select
                    defaultValue={selectedInquiry.status}
                    onValueChange={(v) => handleUpdateStatus(selectedInquiry.id, v, selectedInquiry.adminNotes || "")}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="SPAM">Spam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase font-bold">Payload Data</Label>
                <div className="bg-muted p-4 rounded-lg space-y-2 overflow-auto max-h-60">
                  {Object.entries(selectedInquiry.payload).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 gap-2 py-1 border-b last:border-0 border-muted-foreground/10">
                      <span className="text-xs font-bold text-muted-foreground uppercase">{key.replace(/_/g, " ")}</span>
                      <span className="col-span-2 text-sm">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add private notes about this inquiry..."
                  defaultValue={selectedInquiry.adminNotes || ""}
                  onBlur={(e) => handleUpdateStatus(selectedInquiry.id, selectedInquiry.status, e.target.value)}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

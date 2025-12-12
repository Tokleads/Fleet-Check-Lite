import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { TitanCard } from "@/components/titan-ui/Card";
import { TitanButton } from "@/components/titan-ui/Button";
import { session } from "@/lib/session";
import { 
  FileText,
  Plus,
  Clock,
  Users,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels: Record<string, string> = {
  TOOLBOX_TALK: "Toolbox Talk",
  HANDBOOK: "Handbook",
  POLICY: "Policy",
  NOTICE: "Notice",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function ManagerDocuments() {
  const company = session.getCompany();
  const manager = session.getUser();
  const companyId = company?.id;
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    description: "",
    category: "TOOLBOX_TALK",
    priority: "NORMAL",
    content: "",
    fileUrl: "",
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["manager-documents", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/documents/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: users } = useQuery({
    queryKey: ["users", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/users/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: async (doc: any) => {
      const res = await fetch("/api/manager/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...doc,
          companyId,
          createdBy: manager?.id,
          requiresAcknowledgment: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to create document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-documents"] });
      setShowCreateModal(false);
      setNewDoc({ title: "", description: "", category: "TOOLBOX_TALK", priority: "NORMAL", content: "", fileUrl: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/manager/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-documents"] });
    },
  });

  const driverCount = users?.filter((u: any) => u.role === "DRIVER" && u.active).length || 0;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Driver Documents</h1>
            <p className="text-slate-500 mt-1">Manage documents that drivers must read and acknowledge</p>
          </div>
          <TitanButton size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </TitanButton>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : documents?.length === 0 ? (
          <TitanCard className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No documents yet</h3>
            <p className="text-slate-500 mt-1">Create your first document for drivers to read</p>
            <TitanButton size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </TitanButton>
          </TitanCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents?.filter((d: any) => d.active).map((doc: any) => (
              <TitanCard key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[doc.priority] || priorityColors.NORMAL}`}>
                        {doc.priority}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-1">{doc.title}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{doc.description || doc.content?.substring(0, 100)}</p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{categoryLabels[doc.category] || doc.category}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3 w-3" />
                    0/{driverCount} read
                  </div>
                </div>
              </TitanCard>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TitanCard className="w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">New Document</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Weekly Toolbox Talk - Winter Driving"
                  data-testid="input-doc-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    data-testid="select-doc-category"
                  >
                    <option value="TOOLBOX_TALK">Toolbox Talk</option>
                    <option value="HANDBOOK">Handbook</option>
                    <option value="POLICY">Policy</option>
                    <option value="NOTICE">Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newDoc.priority}
                    onChange={(e) => setNewDoc({ ...newDoc, priority: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    data-testid="select-doc-priority"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Brief summary of the document..."
                  data-testid="input-doc-description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Full document content..."
                  data-testid="input-doc-content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">External Link (optional)</label>
                <input
                  type="url"
                  value={newDoc.fileUrl}
                  onChange={(e) => setNewDoc({ ...newDoc, fileUrl: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://drive.google.com/..."
                  data-testid="input-doc-url"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <TitanButton variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </TitanButton>
              <TitanButton 
                onClick={() => createMutation.mutate(newDoc)}
                disabled={!newDoc.title || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Document"}
              </TitanButton>
            </div>
          </TitanCard>
        </div>
      )}
    </ManagerLayout>
  );
}

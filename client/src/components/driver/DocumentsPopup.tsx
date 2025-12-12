import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TitanCard } from "@/components/titan-ui/Card";
import { TitanButton } from "@/components/titan-ui/Button";
import { session } from "@/lib/session";
import { 
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

const categoryLabels: Record<string, string> = {
  TOOLBOX_TALK: "Toolbox Talk",
  HANDBOOK: "Handbook",
  POLICY: "Policy",
  NOTICE: "Notice",
};

const priorityColors: Record<string, string> = {
  LOW: "border-slate-200",
  NORMAL: "border-blue-200",
  HIGH: "border-amber-300",
  URGENT: "border-red-300",
};

interface DocumentsPopupProps {
  onClose: () => void;
}

export function DocumentsPopup({ onClose }: DocumentsPopupProps) {
  const company = session.getCompany();
  const driver = session.getUser();
  const companyId = company?.id;
  const userId = driver?.id;
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<number>>(new Set());

  const { data: unreadDocs, isLoading } = useQuery({
    queryKey: ["unread-documents", companyId, userId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/unread?companyId=${companyId}&userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!companyId && !!userId,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const res = await fetch(`/api/documents/${documentId}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to acknowledge document");
      return res.json();
    },
    onSuccess: (_, documentId) => {
      setAcknowledgedIds(prev => new Set(Array.from(prev).concat(documentId)));
      queryClient.invalidateQueries({ queryKey: ["unread-documents"] });
      setSelectedDoc(null);
    },
  });

  const remainingDocs = unreadDocs?.filter((d: any) => !acknowledgedIds.has(d.id)) || [];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <TitanCard className="w-full max-w-md p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Loading documents...</p>
        </TitanCard>
      </div>
    );
  }

  if (remainingDocs.length === 0) {
    return null;
  }

  if (selectedDoc) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <TitanCard className="w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm text-slate-500">{categoryLabels[selectedDoc.category] || selectedDoc.category}</span>
            </div>
            <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-slate-100 rounded">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedDoc.title}</h2>
            {selectedDoc.description && (
              <p className="text-slate-600 mb-4">{selectedDoc.description}</p>
            )}
            {selectedDoc.content && (
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {selectedDoc.content}
              </div>
            )}
            {selectedDoc.fileUrl && (
              <a 
                href={selectedDoc.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View attached file
              </a>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <TitanButton 
              className="w-full h-14 text-base"
              onClick={() => acknowledgeMutation.mutate(selectedDoc.id)}
              disabled={acknowledgeMutation.isPending}
            >
              {acknowledgeMutation.isPending ? (
                "Confirming..."
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  I have read and understood this document
                </>
              )}
            </TitanButton>
          </div>
        </TitanCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <TitanCard className="w-full max-w-md">
        <div className="p-6 text-center border-b border-slate-100">
          <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Driver Documents</h2>
          <p className="text-slate-500 mt-1">
            You have {remainingDocs.length} new document{remainingDocs.length !== 1 ? 's' : ''} to read.
          </p>
        </div>

        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {remainingDocs.map((doc: any) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 ${priorityColors[doc.priority]} bg-white hover:bg-slate-50 transition-colors text-left`}
              data-testid={`button-doc-${doc.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{doc.title}</p>
                  <p className="text-xs text-slate-500">{categoryLabels[doc.category] || doc.category}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          <TitanButton variant="outline" className="flex-1" onClick={onClose}>
            Close
          </TitanButton>
          <TitanButton className="flex-1" onClick={() => setSelectedDoc(remainingDocs[0])}>
            View documents
          </TitanButton>
        </div>
      </TitanCard>
    </div>
  );
}

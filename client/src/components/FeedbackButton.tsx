import { useState } from "react";
import { MessageSquarePlus, X, Bug, Lightbulb, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type FeedbackType = "bug" | "feature";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim(), page: window.location.pathname }),
      });
      toast({ title: "Thanks for your feedback!", description: "We'll review this shortly." });
      setMessage("");
      setIsOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Failed to send", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 z-30 h-10 w-10 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center group"
        data-testid="button-feedback"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="h-4.5 w-4.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 left-4 right-4 sm:left-4 sm:right-auto sm:w-80 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Send Feedback</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setType("bug")}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
                      type === "bug"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                    data-testid="button-feedback-bug"
                  >
                    <Bug className="h-4 w-4" />
                    Bug Report
                  </button>
                  <button
                    onClick={() => setType("feature")}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
                      type === "feature"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                    data-testid="button-feedback-feature"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Feature Request
                  </button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={type === "bug" ? "What went wrong?" : "What would you like to see?"}
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  data-testid="input-feedback-message"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isSubmitting}
                  className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 titan-btn-press"
                  data-testid="button-submit-feedback"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

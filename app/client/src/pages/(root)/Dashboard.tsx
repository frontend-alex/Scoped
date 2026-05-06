import { useEffect, useState } from "react";
import { FileText, LoaderCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { apiRequest, type DashboardAnalysis } from "@/lib/api";
import AnalysisDetails from "@/components/dashboard/AnalysisDetails";

const Dashboard = () => {
  const { user, pending, authenticated } = useUser();
  const { id } = useParams();

  const [selectedAnalysis, setSelectedAnalysis] =
    useState<DashboardAnalysis | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const primaryButton =
  "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-70";

  const selectedFileSize = selectedFile
    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
    : null;

  const loadLatestAnalysis = async () => {
    try {
      setIsLoadingAnalysis(true);

      const data = await apiRequest<DashboardAnalysis[]>("/api/dashboard/history", {
        method: "GET",
      });

      setSelectedAnalysis(data.length > 0 ? data[0] : null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load dashboard history.",
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const loadAnalysisById = async (analysisId: string) => {
    try {
      setIsLoadingAnalysis(true);

      const data = await apiRequest<DashboardAnalysis>(
        `/api/dashboard/${analysisId}`,
        {
          method: "GET",
        },
      );

      setSelectedAnalysis(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load dashboard analysis.",
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    if (!pending && authenticated) {
      if (id) {
        void loadAnalysisById(id);
      } else {
        void loadLatestAnalysis();
      }
    }
  }, [pending, authenticated, id]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await apiRequest<DashboardAnalysis>("/api/dashboard/analyze", {
        method: "POST",
        body: formData,
      });

      setSelectedAnalysis(result);
      setSelectedFile(null);
      setIsUploadOpen(false);
      toast.success("Dashboard uploaded successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload dashboard.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (pending || isLoadingAnalysis) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  const handlePasteFile = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;

    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();

        if (file) {
          setSelectedFile(file);
          toast.success("Pasted image selected.");
          return;
        }
      }
    }

    toast.error("No image or file found in clipboard.");
  };

  const handleDropFile = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      toast.error("No file found in drop.");
      return;
    }

    setSelectedFile(file);
    toast.success("Dropped file selected.");
  };

  return (
    <div className="min-h-screen bg-background ">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 border-b py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">
              Your Drafts
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome{user ? `, ${user.username}` : ""}. Upload a dashboard and
              review its IBCS analysis.
            </p>
          </div>

          <Dialog
            open={isUploadOpen}
            onOpenChange={(open) => {
              if (isUploading) return;
              setIsUploadOpen(open);
              if (!open) setSelectedFile(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className={primaryButton}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Upload a dashboard so we can analyse it. You can also paste a
                  screenshot into the upload area with Ctrl + V.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div
                  onPaste={handlePasteFile}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setIsDraggingFile(false);
                    }
                  }}
                  onDrop={handleDropFile}
                  tabIndex={0}
                  className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center outline-none transition focus:border-ring ${
                    isDraggingFile
                      ? "border-foreground/50 bg-accent"
                      : "border-muted-foreground/30 bg-muted/60 hover:border-foreground/30 hover:bg-accent"
                  }`}
                >
                  <div className="rounded-full border-2 border-dashed border-muted-foreground/25 bg-background p-4 shadow-sm">
                    <FileText className="size-8 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      Drop dashboard files here
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      PNG, JPG, PDF, PPTX, DOCX or paste a screenshot with Ctrl + V
                    </p>
                  </div>

                  <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-foreground">
                    Browse files
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf,.pptx,.docx"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] ?? null)
                      }
                      className="sr-only"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-3 rounded-xl border bg-background p-3 shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile.type || "Selected file"} · {selectedFileSize}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isUploading}>
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className={primaryButton}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    "Add New Dashboard"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <AnalysisDetails analysis={selectedAnalysis} />
      </div>
    </div>
  );
};

export default Dashboard;

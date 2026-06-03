import {
  AlertCircle,
  FileImage,
  Loader2,
  UploadCloud,
  WandSparkles,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { AnalysisDetails } from "./components/AnalysisDetails";
import { useDashboardAnalysis } from "./hooks/useDashboardAnalysis";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const {
    selectedFile,
    selectedFileLabel,
    currentAnalysis,
    isLoading,
    isUploading,
    errorMessage,
    setSelectedFile,
    handleUpload,
  } = useDashboardAnalysis();

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-xl font-semibold"> Dashboard analyzer</h1>
            <p className="text-sm text-stone-400">
              Upload a screenshot and review detected charts in grouped cards.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl ">
              <UploadCloud className="size-5 shrink-0 text-muted-foreground" />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {selectedFileLabel}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG</p>
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null);
                }}
              />
            </label>

          
            <Button
                   disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
                {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!currentAnalysis && !isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed bg-background/70 p-4 text-sm text-muted-foreground">
            <FileImage className="size-5 shrink-0" />
            <span>
              No dashboard analysis loaded yet. Upload an image to start.
            </span>
          </div>
        )}
      </section>

      <AnalysisDetails analysis={currentAnalysis} />
    </div>
  );
}

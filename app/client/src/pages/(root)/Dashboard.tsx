import { useEffect, useState } from "react";
import { FileImage, Loader2, UploadCloud } from "lucide-react";

import {
  getDashboardHistory,
  uploadDashboard,
  type DashboardAnalysis,
} from "@/lib/api";

import { AnalysisDetails } from "@/components/dashboard/AnalysisDetails";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<DashboardAnalysis | null>(null);
  const [history, setHistory] = useState<DashboardAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadLatestAnalysis() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getDashboardHistory();
      setHistory(data);

      if (data.length > 0) {
        setCurrentAnalysis(data[0]);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load dashboard history.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage("Please select a dashboard image first.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const result = await uploadDashboard(selectedFile);

      setCurrentAnalysis(result);
      setSelectedFile(null);

      const updatedHistory = await getDashboardHistory();
      setHistory(updatedHistory);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not upload dashboard.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  useEffect(() => {
    void loadLatestAnalysis();
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
      <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_420px] xl:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                IBCS Compliance
              </span>

              <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {isLoading ? "Loading latest..." : `${history.length} saved`}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard analyzer
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload a dashboard image and receive compact IBCS feedback,
              chart-level audit results, and detected visual elements.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed bg-background p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl bg-accent p-3 transition hover:bg-accent/80">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background">
                  <UploadCloud className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedFile
                      ? selectedFile.name
                      : "Choose dashboard image"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or JPEG
                  </p>
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

              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={handleUpload}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {errorMessage}
          </div>
        )}
      </section>

      <AnalysisDetails analysis={currentAnalysis} />
    </main>
  );
}
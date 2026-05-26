import { useEffect, useState } from "react";
import { FileImage, Loader2, UploadCloud } from "lucide-react";

import {
  getDashboardAnalysis,
  getDashboardHistory,
  uploadDashboard,
  type DashboardAnalysis,
} from "@/lib/api";

import { AnalysisDetails } from "@/components/dashboard/AnalysisDetails";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DashboardAnalysis | null>(null);
  const [history, setHistory] = useState<DashboardAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadHistory() {
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
        error instanceof Error ? error.message : "Could not load dashboard history.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAnalysisById(id: number) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getDashboardAnalysis(id);
      setCurrentAnalysis(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load analysis.",
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
    void loadHistory();
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              IBCS Compliance
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Dashboard analyzer
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload a dashboard image. The backend detects chart elements,
              audits chart crops, and returns IBCS feedback.
            </p>
          </div>

          <div className="rounded-2xl bg-accent p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-background">
                <FileImage className="size-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">
                  {history.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  Saved analyses
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed bg-background p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <label className="flex flex-1 cursor-pointer items-center gap-4 rounded-xl bg-accent p-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-background">
                <UploadCloud className="size-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {selectedFile ? selectedFile.name : "Choose PNG, JPG, or JPEG file"}
                </p>

                <p className="text-xs text-muted-foreground">
                  The image will be analyzed by the backend model.
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
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze dashboard"
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {errorMessage}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              History
            </h2>

            {isLoading && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {history.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No dashboard analyses yet.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void loadAnalysisById(item.id)}
                  className={`w-full rounded-xl border p-4 text-left transition hover:bg-accent ${
                    currentAnalysis?.id === item.id ? "bg-accent" : "bg-background"
                  }`}
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.original_filename}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">
                      {item.status}
                    </span>

                    <span>
                      {item.overall_score ?? "-"}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section>
          <AnalysisDetails analysis={currentAnalysis} />
        </section>
      </div>
    </main>
  );
}
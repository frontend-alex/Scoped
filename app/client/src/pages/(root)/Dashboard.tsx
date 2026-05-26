import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileImage,
  Loader2,
  UploadCloud,
  WandSparkles,
} from "lucide-react";

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

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) return "Choose dashboard image";
    return selectedFile.name;
  }, [selectedFile]);

  async function loadLatestAnalysis() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getDashboardHistory();

      setHistory(data);

      if (data.length > 0) {
        setCurrentAnalysis(data[0]);
      } else {
        setCurrentAnalysis(null);
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
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
        <section className="rounded-3xl border bg-card/90 p-4 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1fr_520px] xl:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                  IBCS Compliance
                </span>

                <span className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {history.length} saved
                </span>

                {isLoading && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Loading
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Dashboard analyzer
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Upload a screenshot and review detected charts in grouped cards.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl bg-muted/60 px-3 py-2 transition hover:bg-muted">
                  <UploadCloud className="size-5 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {selectedFileLabel}
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
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <WandSparkles className="mr-2 size-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!currentAnalysis && !isLoading && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed bg-background/70 p-4 text-sm text-muted-foreground">
              <FileImage className="size-5 shrink-0" />
              <span>No dashboard analysis loaded yet. Upload an image to start.</span>
            </div>
          )}
        </section>

        <AnalysisDetails analysis={currentAnalysis} />
      </div>
    </main>
  );
}
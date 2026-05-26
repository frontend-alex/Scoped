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
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("");
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
        setSelectedAnalysisId(String(data[0].id));
      } else {
        setCurrentAnalysis(null);
        setSelectedAnalysisId("");
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
      setSelectedAnalysisId(String(result.id));
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

  function handleHistoryChange(value: string) {
    setSelectedAnalysisId(value);

    const selectedAnalysis = history.find(
      (analysis) => String(analysis.id) === value,
    );

    setCurrentAnalysis(selectedAnalysis ?? null);
  }

  useEffect(() => {
    void loadLatestAnalysis();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
        <section className="overflow-hidden rounded-[1.75rem] border bg-card shadow-sm">
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative grid gap-5 xl:grid-cols-[1fr_450px] xl:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <WandSparkles className="size-3.5 text-primary" />
                    IBCS Compliance
                  </span>

                  <span className="rounded-full border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {isLoading ? "Loading latest..." : `${history.length} saved`}
                  </span>
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Dashboard analyzer
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Upload one dashboard screenshot, or a full image containing
                  many dashboards. The result is grouped into clear sections so
                  it stays easy to scan.
                </p>

                {history.length > 0 && (
                  <div className="mt-4 max-w-xl">
                    <label
                      htmlFor="analysis-history"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Open previous analysis
                    </label>

                    <select
                      id="analysis-history"
                      value={selectedAnalysisId}
                      onChange={(event) =>
                        handleHistoryChange(event.target.value)
                      }
                      className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {history.map((analysis) => (
                        <option key={analysis.id} value={String(analysis.id)}>
                          {analysis.original_filename} ·{" "}
                          {analysis.overall_score ?? "-"}%
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-dashed bg-background/80 p-3 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-3">
                  <label className="group flex min-w-0 cursor-pointer items-center gap-4 rounded-2xl bg-accent/70 p-4 transition hover:bg-accent">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm transition group-hover:scale-105">
                      {selectedFile ? (
                        <FileImage className="size-6 text-primary" />
                      ) : (
                        <UploadCloud className="size-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {selectedFileLabel}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, or JPEG. Best results with a clear screenshot.
                      </p>
                    </div>

                    <span className="hidden rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
                      Browse
                    </span>

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
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Analyzing
                      </>
                    ) : (
                      <>
                        <WandSparkles className="mr-2 size-4" />
                        Analyze dashboard
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </section>

        <AnalysisDetails analysis={currentAnalysis} />
      </div>
    </main>
  );
}
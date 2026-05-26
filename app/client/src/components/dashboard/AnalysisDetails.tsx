import { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  FileImage,
  Info,
  Layers3,
  ListChecks,
  Loader2,
  MessageSquareText,
  Search,
  XCircle,
} from "lucide-react";

import {
  getStaticFileUrl,
  type DashboardAnalysis,
  type FeedbackItem,
} from "@/lib/api";

type AnalysisDetailsProps = {
  analysis: DashboardAnalysis | null;
};

type ActiveTab = "overview" | "preview" | "charts" | "feedback" | "details";

function getScoreTone(score?: number | null) {
  if (score === null || score === undefined) {
    return {
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
      bar: "bg-muted-foreground",
      soft: "bg-accent",
      label: "Unknown",
    };
  }

  if (score >= 80) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
      soft: "bg-emerald-50 dark:bg-emerald-950/30",
      label: "Compliant",
    };
  }

  if (score >= 60) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
      soft: "bg-amber-50 dark:bg-amber-950/30",
      label: "Partial",
    };
  }

  return {
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-500",
    soft: "bg-red-50 dark:bg-red-950/30",
    label: "Non-compliant",
  };
}

function getFeedbackTone(status: FeedbackItem["status"], score: number) {
  if (status === "pass" || score >= 80) {
    return {
      icon: CheckCircle2,
      badge:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
    };
  }

  if (status === "warning" || score >= 60) {
    return {
      icon: AlertCircle,
      badge:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
    };
  }

  return {
    icon: XCircle,
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
    dot: "bg-red-500",
    bar: "bg-red-500",
  };
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed bg-card p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent">
        <FileImage className="size-7 text-muted-foreground" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-foreground">
        No analysis selected
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Upload a dashboard image to see the IBCS compliance result.
      </p>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: typeof BarChart3;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-accent text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function AnalysisDetails({ analysis }: AnalysisDetailsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const derived = useMemo(() => {
    const detections = analysis?.detections_json?.detections ?? [];
    const chartAudits = analysis?.detections_json?.chart_audits ?? [];
    const feedbackItems = analysis?.feedback_json ?? [];
    const annotatedImageUrl = analysis
      ? getStaticFileUrl(analysis.annotated_image_path)
      : null;

    const failedFeedbackCount = feedbackItems.filter(
      (item) => item.status === "fail" || item.score < 60,
    ).length;

    const warningFeedbackCount = feedbackItems.filter(
      (item) => item.status === "warning" || (item.score >= 60 && item.score < 80),
    ).length;

    return {
      detections,
      chartAudits,
      feedbackItems,
      annotatedImageUrl,
      failedFeedbackCount,
      warningFeedbackCount,
    };
  }, [analysis]);

  if (!analysis) {
    return <EmptyState />;
  }

  const {
    detections,
    chartAudits,
    feedbackItems,
    annotatedImageUrl,
    failedFeedbackCount,
    warningFeedbackCount,
  } = derived;

  const scoreTone = getScoreTone(analysis.overall_score);

  const progressWidth = Math.max(
    0,
    Math.min(100, analysis.overall_score ?? 0),
  );

  if (analysis.status === "processing") {
    return (
      <div className="rounded-3xl border bg-card p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-foreground">
          Analysis is processing
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The dashboard is being checked by the model.
        </p>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="rounded-3xl border border-red-200 bg-card p-8 dark:border-red-900/50">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
            <XCircle className="size-6" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Analysis failed
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {analysis.error_message ??
                "Something went wrong while analyzing the dashboard."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="border-b p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_260px] xl:items-center">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Latest analysis</p>

            <h2 className="mt-1 wrap-break-word text-2xl font-semibold text-foreground">
              {analysis.original_filename}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border bg-background px-3 py-1">
                {analysis.file_type}
              </span>

              <span className="rounded-full border bg-background px-3 py-1">
                {formatFileSize(analysis.file_size)}
              </span>

              <span className="rounded-full border bg-background px-3 py-1">
                {formatDate(analysis.created_at)}
              </span>
            </div>
          </div>

          <div className={`rounded-2xl p-4 ${scoreTone.soft}`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Overall score
                </p>

                <p className={`mt-1 text-4xl font-bold ${scoreTone.text}`}>
                  {analysis.overall_score ?? "-"}%
                </p>
              </div>

              <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium capitalize text-foreground">
                {analysis.overall_result?.replaceAll("_", " ") ??
                  scoreTone.label}
              </span>
            </div>

            <div className="mt-4 h-2 rounded-full bg-background">
              <div
                className={`h-2 rounded-full ${scoreTone.bar}`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Detected items</p>
              <Search className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {detections.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Chart audits</p>
              <BarChart3 className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {chartAudits.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <AlertCircle className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {warningFeedbackCount}
            </p>
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Failed checks</p>
              <XCircle className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {failedFeedbackCount}
            </p>
          </div>
        </div>

        {analysis.summary && (
          <div className="mt-4 rounded-2xl border bg-background p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

              <p className="text-sm leading-6 text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-b bg-accent/40 p-3">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "overview"}
            icon={Layers3}
            label="Overview"
            onClick={() => setActiveTab("overview")}
          />

          <TabButton
            active={activeTab === "preview"}
            icon={FileImage}
            label="Preview"
            onClick={() => setActiveTab("preview")}
          />

          <TabButton
            active={activeTab === "charts"}
            icon={BarChart3}
            label="Charts"
            count={chartAudits.length}
            onClick={() => setActiveTab("charts")}
          />

          <TabButton
            active={activeTab === "feedback"}
            icon={MessageSquareText}
            label="Feedback"
            count={feedbackItems.length}
            onClick={() => setActiveTab("feedback")}
          />

          <TabButton
            active={activeTab === "details"}
            icon={ListChecks}
            label="Details"
            onClick={() => setActiveTab("details")}
          />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {activeTab === "overview" && (
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border bg-background p-4">
              <h3 className="text-lg font-semibold text-foreground">
                Quick feedback
              </h3>

              <div className="mt-4 space-y-3">
                {feedbackItems.slice(0, 4).map((item) => {
                  const tone = getFeedbackTone(item.status, item.score);
                  const StatusIcon = tone.icon;

                  return (
                    <div
                      key={`${analysis.id}-overview-${item.category}`}
                      className="rounded-xl border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.category}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {item.message}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${tone.badge}`}
                        >
                          <StatusIcon className="size-3.5" />
                          {item.score}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {feedbackItems.length === 0 && (
                  <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    No feedback available.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <h3 className="text-lg font-semibold text-foreground">
                Chart score summary
              </h3>

              <div className="mt-4 space-y-3">
                {chartAudits.map((audit) => {
                  const auditTone = getScoreTone(audit.score);
                  const width = Math.max(0, Math.min(100, audit.score ?? 0));

                  return (
                    <div
                      key={`${analysis.id}-chart-summary-${audit.chart_number}`}
                      className="rounded-xl border bg-card p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            Chart {audit.chart_number}
                          </p>

                          <p className="truncate text-xs capitalize text-muted-foreground">
                            {audit.class_name.replaceAll("_", " ")}
                          </p>
                        </div>

                        <p className={`text-sm font-bold ${auditTone.text}`}>
                          {audit.score ?? "-"}%
                        </p>
                      </div>

                      <div className="mt-3 h-2 rounded-full bg-accent">
                        <div
                          className={`h-2 rounded-full ${auditTone.bar}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {chartAudits.length === 0 && (
                  <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    No chart audits available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="rounded-2xl border bg-background p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-foreground">
                Detection preview
              </h3>

              <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                Annotated dashboard
              </span>
            </div>

            {annotatedImageUrl ? (
              <div className="overflow-hidden rounded-2xl border bg-accent">
                <img
                  src={annotatedImageUrl}
                  alt="Detected dashboard"
                  className="max-h-130 w-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No annotated preview available.
              </div>
            )}
          </div>
        )}

        {activeTab === "charts" && (
          <div className="grid gap-4 xl:grid-cols-2">
            {chartAudits.map((audit) => {
              const cropUrl = getStaticFileUrl(audit.crop_path);
              const auditTone = getScoreTone(audit.score);

              return (
                <article
                  key={`${analysis.id}-chart-audit-${audit.chart_number}`}
                  className="overflow-hidden rounded-2xl border bg-background"
                >
                  <div className="flex items-start justify-between gap-4 border-b p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Chart {audit.chart_number}
                      </p>

                      <h4 className="mt-1 text-base font-semibold capitalize text-foreground">
                        {audit.class_name.replaceAll("_", " ")}
                      </h4>
                    </div>

                    <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium capitalize text-foreground">
                      {audit.result?.replaceAll("_", " ") ?? "Unknown"}
                    </span>
                  </div>

                  {cropUrl && (
                    <div className="bg-accent p-3">
                      <img
                        src={cropUrl}
                        alt={`Chart ${audit.chart_number} crop`}
                        className="mx-auto max-h-56 w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="rounded-xl bg-accent p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Score
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className={`size-2 rounded-full ${auditTone.dot}`} />
                        {audit.score ?? "-"} / 100
                      </p>
                    </div>

                    <div className="rounded-xl bg-accent p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Confidence
                      </p>

                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {(audit.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <details className="border-t p-4">
                    <summary className="cursor-pointer text-sm font-medium text-foreground">
                      View full audit details
                    </summary>

                    <div className="mt-4 space-y-4">
                      {audit.vlm_result?.identified_scenarios?.length ? (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Identified scenarios
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {audit.vlm_result.identified_scenarios.map(
                              (scenario) => (
                                <span
                                  key={`${analysis.id}-${audit.chart_number}-${scenario}`}
                                  className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground"
                                >
                                  {scenario}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      ) : null}

                      {audit.vlm_result?.penalties && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-accent p-3 text-center">
                            <p className="text-xs text-muted-foreground">
                              Notation
                            </p>

                            <p className="mt-1 text-sm font-semibold text-foreground">
                              -{audit.vlm_result.penalties.notation ?? 0}
                            </p>
                          </div>

                          <div className="rounded-xl bg-accent p-3 text-center">
                            <p className="text-xs text-muted-foreground">
                              Metadata
                            </p>

                            <p className="mt-1 text-sm font-semibold text-foreground">
                              -{audit.vlm_result.penalties.metadata ?? 0}
                            </p>
                          </div>

                          <div className="rounded-xl bg-accent p-3 text-center">
                            <p className="text-xs text-muted-foreground">
                              Visuals
                            </p>

                            <p className="mt-1 text-sm font-semibold text-foreground">
                              -{audit.vlm_result.penalties.visuals ?? 0}
                            </p>
                          </div>
                        </div>
                      )}

                      {audit.vlm_result?.remediation_plan && (
                        <p className="text-sm leading-6 text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Remediation:
                          </span>{" "}
                          {audit.vlm_result.remediation_plan}
                        </p>
                      )}

                      {audit.error && (
                        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                          {audit.error}
                        </p>
                      )}
                    </div>
                  </details>
                </article>
              );
            })}

            {chartAudits.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No chart audits available.
              </div>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="grid gap-4 md:grid-cols-2">
            {feedbackItems.map((item) => {
              const tone = getFeedbackTone(item.status, item.score);
              const StatusIcon = tone.icon;

              return (
                <div
                  key={`${analysis.id}-${item.category}`}
                  className="rounded-2xl border bg-background p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.category}
                      </p>

                      <h4 className="mt-1 text-lg font-semibold text-foreground">
                        Output
                      </h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${tone.badge}`}
                    >
                      <StatusIcon className="size-3.5" />
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {item.message}
                  </p>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className={`size-2 rounded-full ${tone.dot}`} />
                        Score
                      </span>

                      <span className="font-medium text-foreground">
                        {item.score}/100
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-accent">
                      <div
                        className={`h-2 rounded-full ${tone.bar}`}
                        style={{
                          width: `${Math.max(0, Math.min(100, item.score))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {feedbackItems.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No feedback available.
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-background p-4">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Detected elements
              </h3>

              {detections.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {detections.map((detection, index) => (
                    <div
                      key={`${analysis.id}-detection-${index}`}
                      className="rounded-xl bg-accent p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold capitalize text-foreground">
                            {detection.class_name.replaceAll("_", " ")}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Box: {detection.box.join(", ")}
                          </p>
                        </div>

                        <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground">
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  No detected elements available.
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Analysis metadata
              </h3>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-accent p-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(analysis.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-accent p-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(analysis.updated_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-accent p-3">
                  <FileImage className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Stored file:</span>
                  <span className="truncate font-medium text-foreground">
                    {analysis.stored_filename}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-accent p-3">
                  <Info className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium text-foreground">
                    {analysis.confidence ?? "0.0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
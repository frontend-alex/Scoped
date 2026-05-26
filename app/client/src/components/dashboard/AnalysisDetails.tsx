import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Eye,
  FileImage,
  Layers3,
  ListChecks,
  ShieldCheck,
  X,
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

type ActiveTab = "dashboard" | "preview" | "raw";

type SelectedChartModal = {
  chartNumber: number;
} | null;

function getScoreTone(score?: number | null) {
  if (score === null || score === undefined) {
    return {
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
      bar: "bg-muted-foreground",
      badge: "border-border bg-muted text-muted-foreground",
      label: "Unknown",
    };
  }

  if (score >= 80) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      bar: "bg-emerald-500",
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      label: "Good",
    };
  }

  if (score >= 60) {
    return {
      text: "text-amber-400",
      dot: "bg-amber-400",
      bar: "bg-amber-500",
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      label: "Needs work",
    };
  }

  return {
    text: "text-red-400",
    dot: "bg-red-400",
    bar: "bg-red-500",
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
    label: "Problem",
  };
}

function getFeedbackTone(status: FeedbackItem["status"], score: number) {
  if (status === "pass" || score >= 80) {
    return {
      icon: CheckCircle2,
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      bar: "bg-emerald-500",
      dot: "bg-emerald-400",
    };
  }

  if (status === "warning" || score >= 60) {
    return {
      icon: AlertCircle,
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      bar: "bg-amber-500",
      dot: "bg-amber-400",
    };
  }

  return {
    icon: XCircle,
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
    bar: "bg-red-500",
    dot: "bg-red-400",
  };
}

function parseChartNumberFromText(value?: string) {
  if (!value) return null;

  const match = value.match(/chart\s*(\d+)/i);
  if (!match) return null;

  return Number(match[1]);
}

function EmptyState() {
  return (
    <section className="rounded-[1.75rem] border border-dashed bg-card p-10 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20">
        <FileImage className="size-8 text-primary" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-foreground">
        No analysis selected
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Upload a dashboard image to see detected charts, grouped feedback, and
        IBCS compliance results.
      </p>
    </section>
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
  icon: LucideIcon;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}

      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active
              ? "bg-background/20 text-background"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border bg-background/70 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}

function FeedbackModalCard({ item }: { item: FeedbackItem }) {
  const tone = getFeedbackTone(item.status, item.score);
  const StatusIcon = tone.icon;

  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{item.category}</p>

          <h4 className="mt-1 text-lg font-semibold text-foreground">
            Result
          </h4>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone.badge}`}
        >
          <StatusIcon className="size-3.5" />
          {item.status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {item.message}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className={`size-2 rounded-full ${tone.dot}`} />
            Score
          </span>

          <span className="font-semibold text-foreground">
            {item.score}/100
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{
              width: `${Math.max(0, Math.min(100, item.score))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function getMainRemediation(
  chartFeedback: FeedbackItem[],
  remediationPlan?: string,
) {
  const visualFeedback = chartFeedback.find((item) =>
    item.category.toLowerCase().includes("visual"),
  );

  if (remediationPlan) return remediationPlan;

  if (visualFeedback?.message) return visualFeedback.message;

  const weakestFeedback = [...chartFeedback].sort(
    (a, b) => a.score - b.score,
  )[0];

  return weakestFeedback?.message ?? "No remediation available for this chart.";
}

export function AnalysisDetails({ analysis }: AnalysisDetailsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedChartModal, setSelectedChartModal] =
    useState<SelectedChartModal>(null);

  useEffect(() => {
    if (!selectedChartModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedChartModal]);

  const derived = useMemo(() => {
    const detections = analysis?.detections_json?.detections ?? [];
    const chartAudits = analysis?.detections_json?.chart_audits ?? [];
    const feedbackItems = analysis?.feedback_json ?? [];

    const annotatedImageUrl = analysis?.annotated_image_path
      ? getStaticFileUrl(analysis.annotated_image_path)
      : null;

    const ungroupedFeedback = feedbackItems.filter(
      (item) => !parseChartNumberFromText(item.category),
    );

    const passedFeedbackCount = feedbackItems.filter(
      (item) => item.status === "pass" || item.score >= 80,
    ).length;

    const warningFeedbackCount = feedbackItems.filter(
      (item) =>
        item.status === "warning" || (item.score >= 60 && item.score < 80),
    ).length;

    const failedFeedbackCount = feedbackItems.filter(
      (item) => item.status === "fail" || item.score < 60,
    ).length;

    return {
      detections,
      chartAudits,
      feedbackItems,
      annotatedImageUrl,
      ungroupedFeedback,
      passedFeedbackCount,
      warningFeedbackCount,
      failedFeedbackCount,
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
    ungroupedFeedback,
    passedFeedbackCount,
    warningFeedbackCount,
    failedFeedbackCount,
  } = derived;

  const scoreTone = getScoreTone(analysis.overall_score);
  const progressWidth = Math.max(0, Math.min(100, analysis.overall_score ?? 0));

  const sortedChartAudits = [...chartAudits].sort(
    (a, b) => a.chart_number - b.chart_number,
  );

  const selectedAudit = selectedChartModal
    ? sortedChartAudits.find(
        (audit) => audit.chart_number === selectedChartModal.chartNumber,
      )
    : null;

  const selectedChartFeedback = selectedChartModal
    ? feedbackItems.filter(
        (item) =>
          parseChartNumberFromText(item.category) ===
          selectedChartModal.chartNumber,
      )
    : [];

  if (analysis.status === "failed") {
    return (
      <section className="rounded-[1.75rem] border border-red-500/30 bg-card p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
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
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-[1.75rem] border bg-card shadow-sm">
        <div className="border-b p-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Current result
              </p>

              <div className="mt-2 flex flex-wrap items-end gap-3">
                <p className={`text-5xl font-black leading-none ${scoreTone.text}`}>
                  {analysis.overall_score ?? "-"}%
                </p>

                <span
                  className={`mb-1 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${scoreTone.badge}`}
                >
                  {analysis.overall_result?.replaceAll("_", " ") ??
                    scoreTone.label}
                </span>
              </div>

              <div className="mt-4 h-2.5 max-w-xl overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${scoreTone.bar}`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
              <MiniStat label="Charts" value={chartAudits.length} />
              <MiniStat label="Passed" value={passedFeedbackCount} />
              <MiniStat label="Warnings" value={warningFeedbackCount} />
              <MiniStat label="Failed" value={failedFeedbackCount} />
            </div>
          </div>
        </div>

        <div className="border-b bg-muted/30 p-3">
          <div className="flex flex-wrap gap-2 rounded-3xl bg-background/80 p-1.5">
            <TabButton
              active={activeTab === "dashboard"}
              icon={Layers3}
              label="Dashboard cards"
              count={sortedChartAudits.length}
              onClick={() => setActiveTab("dashboard")}
            />

            <TabButton
              active={activeTab === "preview"}
              icon={Eye}
              label="Full preview"
              onClick={() => setActiveTab("preview")}
            />

            <TabButton
              active={activeTab === "raw"}
              icon={ListChecks}
              label="Detected elements"
              count={detections.length}
              onClick={() => setActiveTab("raw")}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              <div className="rounded-3xl border bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                    <ShieldCheck className="size-5 text-muted-foreground" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Chart-by-chart review
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Each card shows the chart result and main remediation.
                      Open a chart to see the full feedback, penalties, and
                      scenario details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {sortedChartAudits.map((audit) => {
                  const auditTone = getScoreTone(audit.score);
                  const cropUrl = audit.crop_path
                    ? getStaticFileUrl(audit.crop_path)
                    : null;

                  const chartFeedback = feedbackItems.filter(
                    (item) =>
                      parseChartNumberFromText(item.category) ===
                      audit.chart_number,
                  );

                  const remediation = getMainRemediation(
                    chartFeedback,
                    audit.vlm_result?.remediation_plan,
                  );

                  return (
                    <article
                      key={`${analysis.id}-chart-${audit.chart_number}`}
                      className="overflow-hidden rounded-3xl border bg-background/70 shadow-sm"
                    >
                      <div className="border-b bg-card/70 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Detected chart {audit.chart_number}
                            </p>

                            <h4 className="mt-1 truncate text-xl font-bold text-foreground">
                              Chart {audit.chart_number}
                            </h4>

                            <p className="mt-1 text-sm capitalize text-muted-foreground">
                              {audit.class_name?.replaceAll("_", " ") ??
                                "Unknown chart type"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${auditTone.badge}`}
                          >
                            {audit.score ?? "-"} / 100
                          </span>
                        </div>

                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${auditTone.bar}`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, audit.score ?? 0),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {cropUrl ? (
                        <div className="border-b bg-muted/30 p-4">
                          <img
                            src={cropUrl}
                            alt={`Chart ${audit.chart_number}`}
                            className="mx-auto max-h-64 w-full rounded-2xl object-contain"
                          />
                        </div>
                      ) : (
                        <div className="border-b bg-muted/30 p-4">
                          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No crop available for this chart.
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 border-b p-4 sm:grid-cols-2">
                        <div className="rounded-2xl border bg-card p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Result
                          </p>

                          <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                            {audit.result?.replaceAll("_", " ") ?? "Unknown"}
                          </p>
                        </div>

                        <div className="rounded-2xl border bg-card p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Confidence
                          </p>

                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {audit.confidence !== undefined
                              ? `${(audit.confidence * 100).toFixed(1)}%`
                              : "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedChartModal({
                              chartNumber: audit.chart_number,
                            })
                          }
                          className="group w-full rounded-2xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground transition group-hover:text-primary">
                                Remediation
                              </p>

                              <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                                {remediation}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition group-hover:border-primary/40 group-hover:text-primary">
                              Full audit
                            </span>
                          </div>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {ungroupedFeedback.length > 0 && (
                <div className="rounded-3xl border bg-background/70 p-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    General dashboard feedback
                  </h3>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {ungroupedFeedback.map((item) => (
                      <FeedbackModalCard
                        key={`${analysis.id}-general-${item.category}`}
                        item={item}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sortedChartAudits.length === 0 && (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No chart audits available.
                </div>
              )}
            </div>
          )}

          {activeTab === "preview" && (
            <div className="rounded-3xl border bg-background/70 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Full annotated preview
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Use this when you need to compare the chart cards with the
                  original full image.
                </p>
              </div>

              {annotatedImageUrl ? (
                <div className="overflow-hidden rounded-3xl border bg-muted/40 p-3">
                  <img
                    src={annotatedImageUrl}
                    alt="Annotated dashboard"
                    className="mx-auto max-h-[42rem] w-full rounded-2xl object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No annotated preview available.
                </div>
              )}
            </div>
          )}

          {activeTab === "raw" && (
            <div className="space-y-4">
              <div className="rounded-3xl border bg-background/70 p-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Detected elements
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Raw detection list. This is mostly useful for debugging.
                </p>

                {detections.length > 0 ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {detections.map((detection, index) => (
                      <div
                        key={`${analysis.id}-detection-${index}`}
                        className="rounded-2xl border bg-card p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold capitalize text-foreground">
                              {detection.class_name?.replaceAll("_", " ") ??
                                "Unknown"}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Box: {detection.box?.join(", ") ?? "Unknown"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                            {detection.confidence !== undefined
                              ? `${(detection.confidence * 100).toFixed(1)}%`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                    No detected elements available.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {selectedChartModal && selectedAudit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedChartModal(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-[70vw] flex-col overflow-hidden rounded-[1.75rem] border bg-card shadow-2xl max-xl:max-w-[90vw] max-sm:max-h-[92vh] max-sm:max-w-[96vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full feedback
                </p>

                <h3 className="mt-1 text-2xl font-bold text-foreground">
                  Chart {selectedAudit.chart_number}
                </h3>

                <p className="mt-1 text-sm capitalize text-muted-foreground">
                  {selectedAudit.class_name?.replaceAll("_", " ") ??
                    "Unknown chart type"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChartModal(null)}
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="modal-scroll min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {selectedChartFeedback.length > 0 ? (
                    selectedChartFeedback.map((item) => (
                      <FeedbackModalCard
                        key={`${analysis.id}-modal-${selectedAudit.chart_number}-${item.category}`}
                        item={item}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                      No feedback found for this chart.
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Audit details
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {selectedAudit.score ?? "-"} / 100
                        </p>
                      </div>

                      <div className="rounded-2xl border bg-card p-3">
                        <p className="text-xs text-muted-foreground">
                          Confidence
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {selectedAudit.confidence !== undefined
                            ? `${(selectedAudit.confidence * 100).toFixed(1)}%`
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedAudit.vlm_result?.identified_scenarios?.length ? (
                    <div className="rounded-2xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Identified scenarios
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedAudit.vlm_result.identified_scenarios.map(
                          (scenario) => (
                            <span
                              key={`${analysis.id}-modal-scenario-${scenario}`}
                              className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground"
                            >
                              {scenario}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}

                  {selectedAudit.vlm_result?.penalties && (
                    <div className="rounded-2xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Penalties
                      </p>

                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
                          <span className="text-sm text-muted-foreground">
                            Notation
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            -{selectedAudit.vlm_result.penalties.notation ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
                          <span className="text-sm text-muted-foreground">
                            Metadata
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            -{selectedAudit.vlm_result.penalties.metadata ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
                          <span className="text-sm text-muted-foreground">
                            Visuals
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            -{selectedAudit.vlm_result.penalties.visuals ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedAudit.vlm_result?.remediation_plan && (
                    <div className="rounded-2xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Remediation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {selectedAudit.vlm_result.remediation_plan}
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
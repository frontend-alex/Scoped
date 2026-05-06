import { AlertTriangle, CheckCircle2, CircleGauge, XCircle } from "lucide-react";

import { type DashboardAnalysis } from "@/lib/api";

type AnalysisDetailsProps = {
  analysis: DashboardAnalysis | null;
};

const getScoreTone = (score: number | null | undefined) => {
  if (score == null) {
    return {
      dot: "bg-muted-foreground",
      icon: CircleGauge,
      label: "Not scored",
    };
  }

  if (score >= 80) {
    return {
      dot: "bg-green-400",
      icon: CheckCircle2,
      label: "Pass",
    };
  }

  if (score >= 60) {
    return {
      dot: "bg-yellow-400",
      icon: AlertTriangle,
      label: "Warning",
    };
  }

  return {
    dot: "bg-red-400",
    icon: XCircle,
    label: "Not pass",
  };
};

const getFeedbackTone = (status: string, score: number) => {
  if (status === "pass" || score >= 80) {
    return {
      badge: "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300",
      bar: "bg-green-400",
      dot: "bg-green-400",
      icon: CheckCircle2,
    };
  }

  if (status === "warning" || score >= 60) {
    return {
      badge: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/30 dark:text-yellow-300",
      bar: "bg-yellow-400",
      dot: "bg-yellow-400",
      icon: AlertTriangle,
    };
  }

  return {
    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
    bar: "bg-red-400",
    dot: "bg-red-400",
    icon: XCircle,
  };
};

const AnalysisDetails = ({ analysis }: AnalysisDetailsProps) => {
  if (!analysis) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Upload a dashboard or select one from your history.
      </div>
    );
  }

  const resultLabel = analysis.overall_result
    ? analysis.overall_result.replaceAll("_", " ")
    : "Unknown";
  const overallScoreTone = getScoreTone(analysis.overall_score);

  return (
    <section className="rounded-2xl">
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">Selected dashboard</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              {analysis.original_filename}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {analysis.summary ?? "No summary available."}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-accent p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Result
                </p>
                <p className="mt-2 text-sm font-semibold capitalize text-foreground">
                  {resultLabel}
                </p>
              </div>

              <div className="rounded-xl bg-accent p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Score
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className={`size-2 rounded-full ${overallScoreTone.dot}`} />
                  <span>{analysis.overall_score ?? "-"} / 100</span>

                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {overallScoreTone.label}
                </p>
              </div>

              <div className="rounded-xl bg-accent p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Confidence
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {analysis.confidence ?? "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">Details</p>

            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  File type
                </p>
                <p className="mt-1 text-foreground">{analysis.file_type}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Size
                </p>
                <p className="mt-1 text-foreground">
                  {(analysis.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 capitalize text-foreground">
                  {analysis.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {analysis.annotated_image_path && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Detection Preview
            </h3>

            <div className="overflow-hidden rounded-2xl border bg-accent">
              <img
                src={`http://127.0.0.1:8000/${analysis.annotated_image_path}`}
                alt="Detected dashboard"
                className="w-full object-contain"
              />
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Feedback categories
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {analysis.feedback_json?.map((item) => {
              const tone = getFeedbackTone(item.status, item.score);
              const StatusIcon = tone.icon;

              return (
                <div
                  key={`${analysis.id}-${item.category}`}
                  className="rounded-2xl border bg-card p-5"
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
                      <span className="font-medium text-foreground">{item.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-accent">
                      <div
                        className={`h-2 rounded-full ${tone.bar}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalysisDetails;

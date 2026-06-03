import {
  apiRequest,
  type ApiEnvelope,
  type DashboardAnalysis,
  type DashboardDetections,
  type DetectionItem,
  type FeedbackItem,
} from "@/lib/api";

type RawDashboardAnalysis = Omit<
  DashboardAnalysis,
  "feedback_json" | "detections_json"
> & {
  feedback_json?: FeedbackItem[] | null;
  detections_json?: DashboardDetections | DetectionItem[] | null;
};

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "status_code" in value &&
    "message" in value &&
    "data" in value
  );
}

function unwrapApiData<T>(value: T | ApiEnvelope<T>): T {
  return isApiEnvelope<T>(value) ? value.data : value;
}

function normalizeDetections(
  detections?: DashboardDetections | DetectionItem[] | null,
): DashboardDetections | null {
  if (!detections) return null;

  if (Array.isArray(detections)) {
    return { detections, chart_audits: [] };
  }

  return {
    detections: detections.detections ?? [],
    chart_audits: detections.chart_audits ?? [],
  };
}

function normalizeAnalysis(analysis: RawDashboardAnalysis): DashboardAnalysis {
  return {
    ...analysis,
    feedback_json: analysis.feedback_json ?? [],
    detections_json: normalizeDetections(analysis.detections_json),
  };
}

export async function analyzeDashboard(file: File): Promise<DashboardAnalysis> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<
    RawDashboardAnalysis | ApiEnvelope<RawDashboardAnalysis>
  >("/api/dashboard/analyze", {
    method: "POST",
    body: formData,
  });

  return normalizeAnalysis(unwrapApiData(response));
}

export async function getDashboardHistory(): Promise<DashboardAnalysis[]> {
  const response = await apiRequest<
    RawDashboardAnalysis[] | ApiEnvelope<RawDashboardAnalysis[]>
  >("/api/dashboard/history", {
    method: "GET",
  });

  return unwrapApiData(response).map(normalizeAnalysis);
}

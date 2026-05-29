const API_BASE_URL = "http://127.0.0.1:8000";

export { API_BASE_URL };

export type ApiEnvelope<T> = {
  status_code: number;
  message: string;
  data: T;
};

export type FeedbackItem = {
  category: string;
  score: number;
  status: "pass" | "warning" | "fail" | string;
  message: string;
};

export type DetectionItem = {
  class_name: string;
  confidence: number;
  box: number[];
};

export type ChartAudit = {
  chart_number: number;
  class_name: string;
  confidence: number;
  box: number[];
  crop_path?: string | null;
  score?: number;
  result?: string;
  vlm_result?: {
    is_chart?: boolean;
    identified_scenarios?: string[];
    step_1_visual_analysis?: string;
    step_2_rule_evaluation?: string;
    feedback_points?: string[];
    penalties?: {
      notation?: number;
      metadata?: number;
      visuals?: number;
    };
    remediation_plan?: string;
  };
  error?: string;
};

export type DashboardDetections = {
  detections: DetectionItem[];
  chart_audits: ChartAudit[];
};

export type DashboardAnalysis = {
  id: number;
  user_id: string | null;

  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;

  status: string;
  overall_result: string | null;
  overall_score: number | null;
  confidence: string | null;
  summary: string | null;
  error_message: string | null;

  feedback_json: FeedbackItem[];
  annotated_image_path?: string | null;
  detections_json?: DashboardDetections | null;

  created_at: string;
  updated_at: string;
};

type RawDashboardAnalysis = Omit<
  DashboardAnalysis,
  "feedback_json" | "detections_json"
> & {
  feedback_json?: FeedbackItem[] | null;
  detections_json?: DashboardDetections | DetectionItem[] | null;
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

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
  if (isApiEnvelope<T>(value)) {
    return value.data;
  }

  return value;
}

function normalizeDetectionsJson(
  detectionsJson?: DashboardDetections | DetectionItem[] | null,
): DashboardDetections | null {
  if (!detectionsJson) {
    return null;
  }

  if (Array.isArray(detectionsJson)) {
    return {
      detections: detectionsJson,
      chart_audits: [],
    };
  }

  return {
    detections: detectionsJson.detections ?? [],
    chart_audits: detectionsJson.chart_audits ?? [],
  };
}

function normalizeDashboardAnalysis(
  analysis: RawDashboardAnalysis,
): DashboardAnalysis {
  return {
    ...analysis,
    feedback_json: analysis.feedback_json ?? [],
    detections_json: normalizeDetectionsJson(analysis.detections_json),
  };
}

export function getStaticFileUrl(path?: string | null): string | null {
  if (!path) return null;

  const normalizedPath = path.replaceAll("\\", "/");

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  return `${API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const isFormData = options?.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();

      if (typeof errorBody.detail === "string") {
        message = errorBody.detail;
      } else if (errorBody.detail) {
        message = JSON.stringify(errorBody.detail);
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // ignore json parse failure
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function uploadDashboard(file: File): Promise<DashboardAnalysis> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<
    RawDashboardAnalysis | ApiEnvelope<RawDashboardAnalysis>
  >("/api/dashboard/analyze", {
    method: "POST",
    body: formData,
  });

  return normalizeDashboardAnalysis(unwrapApiData(response));
}

export async function getDashboardHistory(): Promise<DashboardAnalysis[]> {
  const response = await apiRequest<
    RawDashboardAnalysis[] | ApiEnvelope<RawDashboardAnalysis[]>
  >("/api/dashboard/history", {
    method: "GET",
  });

  return unwrapApiData(response).map(normalizeDashboardAnalysis);
}

export async function getDashboardAnalysis(
  id: number | string,
): Promise<DashboardAnalysis> {
  const response = await apiRequest<
    RawDashboardAnalysis | ApiEnvelope<RawDashboardAnalysis>
  >(`/api/dashboard/${id}`, {
    method: "GET",
  });

  return normalizeDashboardAnalysis(unwrapApiData(response));
}
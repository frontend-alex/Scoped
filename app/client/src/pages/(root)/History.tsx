import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useUser } from "@/context/UserContext";
import { apiRequest, type DashboardAnalysis } from "@/lib/api";

const History = () => {
  const { pending, authenticated } = useUser();
  const navigate = useNavigate();

  const [history, setHistory] = useState<DashboardAnalysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const getScoreDot = (score: number | null | undefined) => {
    if (score == null) return "bg-muted-foreground";
    if (score >= 80) return "bg-green-400";
    if (score >= 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);

      const data = await apiRequest<DashboardAnalysis[]>("/api/dashboard/history", {
        method: "GET",
      });

      setHistory(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load dashboard history.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!pending && authenticated) {
      void loadHistory();
    }
  }, [pending, authenticated]);

  if (pending || isLoadingHistory) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading history...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="border-b py-5">
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Analysis History
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse previously uploaded dashboards and open any analysis in detail.
          </p>
        </div>

        <section>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No previous analyses yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {history.map((item) => {
                const resultLabel =
                  item.overall_result?.replaceAll("_", " ") ?? "unknown";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/dashboard/${item.id}`)}
                    className="group rounded-sm border bg-card p-5 text-left transition hover:border-foreground/30 hover:bg-accent"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {item.original_filename}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted group-hover:bg-background p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Score
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <span
                            className={`size-2 rounded-full ${getScoreDot(item.overall_score)}`}
                          />
                          {item.overall_score ?? "-"} / 100
                        </p>
                      </div>

                      <div className="rounded-xl bg-muted group-hover:bg-background p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Result
                        </p>
                        <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                          {resultLabel}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">
                        {item.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default History;

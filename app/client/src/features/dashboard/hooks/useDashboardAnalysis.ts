import { useEffect, useMemo, useState } from "react";
import * as z from "zod";

import type { DashboardAnalysis } from "@/lib/api";

import { analyzeDashboard, getDashboardHistory } from "../api/dashboard-api";

const dashboardUploadSchema = z
  .instanceof(File)
  .refine(
    (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
    "Please select a PNG, JPG, or JPEG dashboard image.",
  );

export const useDashboardAnalysis = () => {
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

  const loadLatestAnalysis = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getDashboardHistory();

      setHistory(data);
      setCurrentAnalysis(data[0] ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load dashboard history.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    const result = dashboardUploadSchema.safeParse(selectedFile);

    if (!result.success) {
      setErrorMessage(
        result.error.issues[0]?.message ??
          "Please select a dashboard image first.",
      );
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const analysis = await analyzeDashboard(result.data);

      setCurrentAnalysis(analysis);
      setSelectedFile(null);
      setHistory(await getDashboardHistory());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not upload dashboard.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    void loadLatestAnalysis();
  }, []);

  return {
    selectedFile,
    selectedFileLabel,
    currentAnalysis,
    history,
    isLoading,
    isUploading,
    errorMessage,
    setSelectedFile,
    handleUpload,
  };
};

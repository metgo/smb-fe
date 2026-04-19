import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { convertToWebP, uploadWithProgress } from "@/helpers";
import {
  useCreateSignedUrlMutation,
  useDeleteMediaMutation,
} from "@/store/api/mediaMutationApi";

export type FileUploadStatus = "idle" | "uploading" | "success" | "error";

export interface FileUploadState {
  previewUrl: string;
  gcsUrl: string;
  progress: number;
  status: FileUploadStatus;
  isDeleting: boolean;
}

export interface UseFileUploadReturn extends FileUploadState {
  handleFileSelect: (file: File) => void;
  setExternalUrl: (url: string) => void;
  deleteFile: () => Promise<void>;
  reset: () => void;
}

interface UseFileUploadOptions {
  /**
   * Pre-existing URL (edit mode). The hook will treat it as already uploaded.
   */
  initialUrl?: string;
  /**
   * "image" converts to WebP before upload; "video" skips conversion.
   * Defaults to "image".
   */
  mediaType?: "image" | "video";
}

const IDLE_STATE: FileUploadState = {
  previewUrl: "",
  gcsUrl: "",
  progress: 0,
  status: "idle",
  isDeleting: false,
};

/**
 * Reusable hook for single-file upload via GCP presigned URL.
 *
 * Features:
 * - Generates a signed URL, uploads the file and tracks progress (0-100).
 * - On success stores both the local preview URL and the final GCS URL.
 * - On delete: removes the file from GCP when a GCS URL is present.
 * - Handles images (converts to WebP) and videos (uploaded as-is).
 */
export function useFileUpload({
  initialUrl,
  mediaType = "image",
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { t } = useTranslation("toast");

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  const [state, setState] = useState<Omit<FileUploadState, "isDeleting">>(() =>
    initialUrl
      ? {
          previewUrl: initialUrl,
          gcsUrl: initialUrl,
          progress: 100,
          status: "success",
        }
      : { previewUrl: "", gcsUrl: "", progress: 0, status: "idle" },
  );

  /* Hydrate when initialUrl arrives asynchronously (edit mode) */
  useEffect(() => {
    if (initialUrl && state.status === "idle") {
      setState({
        previewUrl: initialUrl,
        gcsUrl: initialUrl,
        progress: 100,
        status: "success",
      });
    }
  }, [initialUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── File selected from input / drag-drop ─────────────────────── */
  const handleFileSelect = useCallback(
    async (file: File) => {
      const blobUrl = URL.createObjectURL(file);

      setState({
        previewUrl: blobUrl,
        gcsUrl: "",
        progress: 0,
        status: "uploading",
      });

      try {
        const fileToUpload =
          mediaType === "image" ? await convertToWebP(file) : file;

        const res = await createSignedUrl([
          { originalName: fileToUpload.name, mimeType: fileToUpload.type },
        ]);
        const { signedUrl, gcsURL } = res.data[0] as {
          signedUrl: string;
          gcsURL: string;
        };

        await uploadWithProgress(fileToUpload, signedUrl, (progress) => {
          setState((prev) => ({ ...prev, progress }));
        });

        URL.revokeObjectURL(blobUrl);

        setState({
          previewUrl: gcsURL,
          gcsUrl: gcsURL,
          progress: 100,
          status: "success",
        });
        toast.success(t("image_upload_success"));
      } catch {
        setState((prev) => ({ ...prev, status: "error" }));
        toast.error(t("image_upload_failed"));
      }
    },
    [createSignedUrl, mediaType, t],
  );

  /* ─── URL-mode: caller sets an external URL directly ───────────── */
  const setExternalUrl = useCallback((url: string) => {
    setState({
      previewUrl: url,
      gcsUrl: url,
      progress: 100,
      status: "success",
    });
  }, []);

  /* ─── Delete ────────────────────────────────────────────────────── */
  const deleteFile = useCallback(async () => {
    if (state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.previewUrl);
    }

    if (state.gcsUrl) {
      try {
        await deleteMedia({ imageUrl: state.gcsUrl });
        toast.success(t("image_deleted"));
      } catch {
        toast.error(t("delete_failed"));
      }
    }

    setState({ previewUrl: "", gcsUrl: "", progress: 0, status: "idle" });
  }, [state.previewUrl, state.gcsUrl, deleteMedia, t]);

  /* ─── Reset (e.g. when switching to URL mode) ───────────────────── */
  const reset = useCallback(() => {
    if (state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ previewUrl: "", gcsUrl: "", progress: 0, status: "idle" });
  }, [state.previewUrl]);

  return {
    ...state,
    isDeleting,
    handleFileSelect,
    setExternalUrl,
    deleteFile,
    reset,
  };
}

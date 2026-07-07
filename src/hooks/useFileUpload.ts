import { useState, useEffect, useCallback, useRef } from "react";
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
   * Callback when the file state changes (upload success, delete, etc.)
   */
  onLogoChange?: (logoData: { image: string } | null) => void;
  /**
   * "image" converts to WebP before upload; "video" skips conversion.
   * Defaults to "image".
   */
  mediaType?: "image" | "video";
}

/**
 * Reusable hook for single-file upload via GCP presigned URL.
 */
export function useFileUpload({
  initialUrl,
  onLogoChange,
  mediaType = "image",
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { t } = useTranslation("toast");

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  // Keep a ref to the latest onLogoChange callback
  const onLogoChangeRef = useRef(onLogoChange);
  onLogoChangeRef.current = onLogoChange;

  const [state, setState] = useState<Omit<FileUploadState, "isDeleting">>(() =>
    initialUrl
      ? {
          previewUrl: initialUrl,
          gcsUrl: initialUrl,
          progress: 100,
          status: "success" as FileUploadStatus,
        }
      : {
          previewUrl: "",
          gcsUrl: "",
          progress: 0,
          status: "idle" as FileUploadStatus,
        },
  );

  /* Hydrate whenever initialUrl changes (arrives asynchronously in edit
   * mode, or switches to a different entity while this hook stays mounted) */
  const initialUrlRef = useRef(initialUrl);

  useEffect(() => {
    // If the initialUrl hasn't changed, do nothing
    if (initialUrl === initialUrlRef.current) return;

    initialUrlRef.current = initialUrl;

    const newState: Omit<FileUploadState, "isDeleting"> = initialUrl
      ? {
          previewUrl: initialUrl,
          gcsUrl: initialUrl,
          progress: 100,
          status: "success" as FileUploadStatus,
        }
      : {
          previewUrl: "",
          gcsUrl: "",
          progress: 0,
          status: "idle" as FileUploadStatus,
        };

    setState(newState);

    // Notify parent about the change ONLY if the URL actually changed
    // and we are not just initializing with the same value that might
    // already be in the parent's state (though usually parent passes fresh prop).
    // However, to avoid the initial PATCH on mount, we check if this is
    // effectively a "reset" or a "new value".

    if (onLogoChangeRef.current) {
      // We pass the data. The parent should ideally handle idempotency,
      // but here we ensure we only call if there is a definitive value.
      onLogoChangeRef.current(initialUrl ? { image: initialUrl } : null);
    }
  }, [initialUrl]);

  /* ─── Sync state to parent via onLogoChange ────────────────────── */
  useEffect(() => {
    if (!onLogoChangeRef.current) return;

    // Only notify when we have a successful upload or when clearing
    if (state.status === "success" && state.gcsUrl) {
      // CRITICAL FIX: Check if the gcsUrl is different from what we might
      // have just hydrated. If state.gcsUrl equals initialUrlRef.current,
      // it means this effect is firing due to hydration, not a user action.
      // However, since hydration effect already calls onLogoChange,
      // we might double-call.

      // Better approach: Only call onLogoChange if the status transitioned
      // to success from something else (like uploading), OR if it was cleared.

      // To strictly prevent the initial mount patch:
      // We can check if the current gcsUrl is the same as the last known "saved" url.
      // But simpler: The hydration effect above handles the initial load.
      // This effect should handle *subsequent* changes (like after a new upload).

      // Let's rely on the fact that hydration sets state immediately.
      // If we want to avoid double calls, we can skip if it matches initialUrl.
      if (state.gcsUrl !== initialUrlRef.current) {
        onLogoChangeRef.current({ image: state.gcsUrl });
      }
    } else if (state.status === "idle") {
      // If we are idle, and we previously had a URL (not just initial empty state)
      if (initialUrlRef.current) {
        onLogoChangeRef.current(null);
      }
    }
  }, [state.status, state.gcsUrl]);

  /* ─── File selected from input / drag-drop ─────────────────────── */
  const handleFileSelect = useCallback(
    async (file: File) => {
      const blobUrl = URL.createObjectURL(file);

      setState({
        previewUrl: blobUrl,
        gcsUrl: "",
        progress: 0,
        status: "uploading" as FileUploadStatus,
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
          status: "success" as FileUploadStatus,
        });
        toast.success(t("image_upload_success"));
      } catch {
        setState((prev) => ({ ...prev, status: "error" as FileUploadStatus }));
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
      status: "success" as FileUploadStatus,
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

    setState({
      previewUrl: "",
      gcsUrl: "",
      progress: 0,
      status: "idle" as FileUploadStatus,
    });
  }, [state.previewUrl, state.gcsUrl, deleteMedia, t]);

  /* ─── Reset (e.g. when switching to URL mode) ───────────────────── */
  const reset = useCallback(() => {
    if (state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({
      previewUrl: "",
      gcsUrl: "",
      progress: 0,
      status: "idle" as FileUploadStatus,
    });
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

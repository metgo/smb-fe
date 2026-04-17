import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { uploadWithProgress } from "@/helpers";
import { useCreateSignedUrlMutation } from "@/store/api/mediaMutationApi";
import { useUploadDocumentMutation } from "@/store/api/doumentMutationApi";

interface UseDocumentUploadProps {
  onSuccess?: () => void;
}

type DocumentUploadState = {
  file: File | null;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
};

export const useDocumentUpload = ({ onSuccess }: UseDocumentUploadProps) => {
  const { t } = useTranslation("documents");

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

  const [docState, setDocState] = useState<DocumentUploadState>({
    file: null,
    progress: 0,
    status: "idle",
  });

  const handleFileSelect = (file: File) => {
    setDocState({ file, progress: 0, status: "idle" });
  };

  const removeFile = () => {
    setDocState({ file: null, progress: 0, status: "idle" });
  };

  const generateSignedUrl = async (file: File) => {
    const res = await createSignedUrl([
      {
        originalName: file.name,
        mimeType: file.type,
      },
    ]);
    return res.data[0];
  };

  const upload = async (payload: {
    title: string;
    subTitle: string;
    externalApiId: string;
    docUrl: string;
    // Remove docUrl, docType, docSize from here if you want to handle them inside the hook
  }) => {
    if (!docState.file) return;

    try {
      setDocState((prev) => ({ ...prev, status: "uploading", progress: 0 }));

      // Step 1: Get signed URL from GCP
      const { signedUrl, gcsURL } = await generateSignedUrl(docState.file);

      // Step 2: Upload file directly to GCP
      await uploadWithProgress(docState.file, signedUrl, (progress) => {
        setDocState((prev) => ({ ...prev, progress }));
      });

      // Step 3: Send correct data to backend
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("subTitle", payload.subTitle);
      formData.append("externalApiId", payload.externalApiId);

      // ✅ Correct fields expected by backend
      formData.append("docUrl", gcsURL); // was "fileUrl"
      formData.append("docType", docState.file.type);
      formData.append("docSize", String(docState.file.size));

      await uploadDocument(formData);

      setDocState((prev) => ({ ...prev, status: "success", progress: 100 }));
      toast.success(t("document_uploaded_success"));
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setDocState((prev) => ({ ...prev, status: "error" }));
      toast.error(t("upload_failed"));
    }
  };

  return {
    docState,
    isLoading,
    handleFileSelect,
    removeFile,
    upload,
  };
};

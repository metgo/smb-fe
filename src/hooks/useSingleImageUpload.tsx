import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import { convertToWebP, uploadWithProgress } from "@/helpers";
import {
  useCreateSignedUrlMutation,
  useDeleteMediaMutation,
} from "@/store/api/mediaMutationApi";

interface UseSingleImageUploadProps {
  initialImage?: string;
  onChange: (image: IImage | null) => void;
}

export const useSingleImageUpload = ({
  initialImage,
  onChange,
}: UseSingleImageUploadProps) => {
  const { t } = useTranslation("toast");

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia, { isLoading: isImageDeleting }] =
    useDeleteMediaMutation();

  const [image, setImage] = useState<IImageUpload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  /* ---------------- Hydrate existing image ---------------- */
  useEffect(() => {
    if (!initialImage || image) return;

    setImage({
      id: Date.now(),
      previewUrl: initialImage,
      progress: 100,
      status: "success",
      gcsURL: initialImage,
    });
  }, [initialImage, image]);

  /* ---------------- File select ---------------- */
  const handleImageSelect = (file: File, autoUpload = false) => {
    setImage({
      id: Date.now(),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "idle",
    });
    if (autoUpload) uploadImage(file);
  };

  /* ---------------- Signed URL ---------------- */
  const generateSignedUrl = async (file: File) => {
    const res = await createSignedUrl([
      {
        originalName: file.name,
        mimeType: file.type,
      },
    ]);

    return res.data[0];
  };

  /* ---------------- Upload ---------------- */
  const uploadImage = async (fileOverride?: File) => {
    const file = fileOverride ?? image?.file;
    if (!file) return;

    try {
      setImage((prev) => prev && { ...prev, status: "uploading", progress: 0 });

      const webpFile = await convertToWebP(file);
      const { signedUrl, gcsURL } = await generateSignedUrl(webpFile);

      await uploadWithProgress(webpFile, signedUrl, (progress) => {
        setImage((prev) => prev && { ...prev, progress });
      });

      setImage(
        (prev) =>
          prev && {
            ...prev,
            status: "success",
            progress: 100,
            gcsURL,
          },
      );
      toast.success(t("image_upload_success"));
      return gcsURL;
    } catch {
      setImage((prev) => prev && { ...prev, status: "error" });
      toast.error(t("image_upload_failed"));
      return "";
    }
  };

  /* ---------------- Remove local image ---------------- */
  const removeImage = () => {
    if (image?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImage(null);
    onChange(null);
  };

  const handleDeleteImage = (
    image: IImageUpload,
    opMode: TTicketOpMode = "CREATE",
  ) => {
    if (image.status !== "success" || opMode === "DUPLICATE") {
      removeImage();
      return;
    }
    if (image?.gcsURL) setDeleteTarget(image.gcsURL);
  };

  /* ---------------- Delete from GCS ---------------- */
  const confirmDelete = async () => {
    if (!image?.gcsURL) return;

    try {
      await deleteMedia({ imageUrl: image.gcsURL });
      toast.success(t("image_deleted"));
    } catch {
      toast.error(t("delete_failed"));
    } finally {
      removeImage();
      setDeleteTarget(null);
    }
  };

  /* ---------------- Sync payload ---------------- */
  useEffect(() => {
    if (image?.status === "success" && image.gcsURL) {
      onChange({ image: image.gcsURL });
    }
  }, [image, onChange]);

  return {
    image,
    isImageDeleting,
    handleImageSelect,
    uploadImage,
    removeImage,
    setDeleteTarget,
    deleteTarget,
    handleDeleteImage,
    confirmDelete,
  };
};

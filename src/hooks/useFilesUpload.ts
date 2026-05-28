import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";

import { convertToWebP, uploadWithProgress } from "@/helpers";
import {
  useCreateSignedUrlMutation,
  useDeleteMediaMutation,
} from "@/store/api/mediaMutationApi";

interface UseFilesUploadOptions {
  initialImages?: IImage[];
  onChange?: (images: TImages) => void;
}

/**
 * Multi-file variant of useFileUpload.
 * Each file is uploaded to GCS immediately upon selection — no deferred uploadAll() step.
 */
export function useFilesUpload({
  initialImages = [],
  onChange,
}: UseFilesUploadOptions = {}) {
  const { t } = useTranslation("toast");

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia, { isLoading: isImageDeleting }] =
    useDeleteMediaMutation();

  const imagesRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<IImageUpload[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<IDeleteTarget | null>(null);

  /* ─── Hydrate existing images (edit mode) ────────────────────────── */
  useEffect(() => {
    if (!initialImages?.length || images.length) return;

    const hasPrimary = initialImages.some((img) => img.isPrimary);
    const hydrated: IImageUpload[] = initialImages.map((img, index) => ({
      id: Date.now() + index,
      previewUrl: img.image,
      progress: 100,
      status: "success" as const,
      isPrimary: img.isPrimary || (!hasPrimary && index === 0),
      gcsURL: img.image,
    }));

    setImages(hydrated);
    setPrimaryImageIndex(hydrated.findIndex((i) => i.isPrimary) || 0);
  }, [initialImages, images.length]);

  /* ─── Sync payload to parent ─────────────────────────────────────── */
  useEffect(() => {
    if (!onChange) return;
    const payload: TImages = images
      .filter((img) => img.status === "success")
      .map((img) => ({ image: img.gcsURL!, isPrimary: img.isPrimary }));
    onChange(payload);
  }, [images, onChange]);

  /* ─── File selection → immediate upload ─────────────────────────── */
  const handleImageUpload = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      const placeholders: IImageUpload[] = fileArray.map((file, index) => ({
        id: Date.now() + index,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "uploading" as const,
        isPrimary: false,
      }));

      setImages((prev) => [...prev, ...placeholders]);
      imagesRef.current?.scrollIntoView({ behavior: "smooth" });

      for (const item of placeholders) {
        try {
          const webpFile = await convertToWebP(item.file!);

          const res = await createSignedUrl([
            { originalName: webpFile.name, mimeType: webpFile.type },
          ]);
          const { signedUrl, gcsURL } = res.data[0] as {
            signedUrl: string;
            gcsURL: string;
          };

          await uploadWithProgress(webpFile, signedUrl, (progress) => {
            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id ? { ...img, progress } : img,
              ),
            );
          });

          URL.revokeObjectURL(item.previewUrl);

          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? {
                    ...img,
                    previewUrl: gcsURL,
                    gcsURL,
                    progress: 100,
                    status: "success",
                  }
                : img,
            ),
          );
          toast.success(t("image_upload_success"));
        } catch {
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id ? { ...img, status: "error" } : img,
            ),
          );
          toast.error(t("image_upload_failed"));
        }
      }
    },
    [createSignedUrl, t],
  );

  /* ─── Primary image ──────────────────────────────────────────────── */
  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  };

  /* ─── Remove locally ─────────────────────────────────────────────── */
  const removeImage = (index: number) => {
    const newPrimaryIndex =
      primaryImageIndex === index
        ? 0
        : index < primaryImageIndex
          ? primaryImageIndex - 1
          : primaryImageIndex;

    setImages((prev) => {
      const img = prev[index];
      if (img?.previewUrl?.startsWith("blob:"))
        URL.revokeObjectURL(img.previewUrl);
      return prev
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, isPrimary: i === newPrimaryIndex }));
    });

    setPrimaryImageIndex(newPrimaryIndex);
  };

  /* ─── Delete (local or from GCS) ────────────────────────────────── */
  const handleDeleteImage = (image: IImageUpload, index: number) => {
    if (image.status !== "success") {
      removeImage(index);
      return;
    }
    if (image.gcsURL) setDeleteTarget({ imageUrl: image.gcsURL, index });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia({ imageUrl: deleteTarget.imageUrl });
      removeImage(deleteTarget.index);
      toast.success(t("image_deleted"));
    } catch {
      toast.error(t("delete_failed"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return {
    images,
    setImages,
    imagesRef,
    primaryImageIndex,
    setPrimaryImage,
    handleImageUpload,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  };
}

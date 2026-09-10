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
  onImagesChange?: (updatedImages: TImages) => void;
  /**
   * When true, deleting an existing (already-uploaded) image only clears it
   * locally so a new image can be uploaded in its place — the remote GCS
   * file is never removed. Use this when the images belong to a source
   * record being duplicated, not to the record currently being edited.
   */
  skipRemoteDelete?: boolean;
}

/**
 * Multi-file variant of useFileUpload.
 * Each file is uploaded to GCS immediately upon selection — no deferred uploadAll() step.
 */
export function useFilesUpload({
  initialImages = [],
  onChange,
  onImagesChange,
  skipRemoteDelete = false,
}: UseFilesUploadOptions = {}) {
  const { t } = useTranslation("toast");

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia, { isLoading: isImageDeleting }] =
    useDeleteMediaMutation();

  const onImagesChangeRef = useRef(onImagesChange);
  onImagesChangeRef.current = onImagesChange;

  const imagesRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<IImageUpload[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<IDeleteTarget | null>(null);
  const hasHydratedRef = useRef(false);

  /* ─── Hydrate existing images (edit mode) ────────────────────────── */
  useEffect(() => {
    if (!initialImages?.length || hasHydratedRef.current) return;
    hasHydratedRef.current = true;

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
  }, [initialImages]);

  /* ─── Sync payload to parent ─────────────────────────────────────── */
  useEffect(() => {
    if (!onChange) return;
    const payload: TImages = images
      .filter((img) => img.status === "success")
      .map((img) => ({ image: img.gcsURL!, isPrimary: img.isPrimary }));
    onChange(payload);
  }, [images]);

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

      setImages((prev) => {
        // If there are no existing images, the first new image becomes primary
        const isFirstUpload = prev.length === 0;
        return [
          ...prev,
          ...placeholders.map((p, i) => ({
            ...p,
            isPrimary: isFirstUpload && i === 0,
          })),
        ];
      });
      imagesRef.current?.scrollIntoView({ behavior: "smooth" });

      let finalImages: IImageUpload[] = [];

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

          setImages((prev) => {
            const next = prev.map((img) =>
              img.id === item.id
                ? {
                    ...img,
                    previewUrl: gcsURL,
                    gcsURL,
                    progress: 100,
                    status: "success" as const,
                  }
                : img,
            );
            finalImages = next;
            return next;
          });
          toast.success(t("image_upload_success"));
        } catch {
          setImages((prev) => {
            const next = prev.map((img) =>
              img.id === item.id ? { ...img, status: "error" } : img,
            );
            finalImages = next;
            return next;
          });
          toast.error(t("image_upload_failed"));
        }
      }

      if (finalImages.length) {
        const payload: TImages = finalImages
          .filter((img) => img.status === "success")
          .map((img) => ({ image: img.gcsURL!, isPrimary: img.isPrimary }));
        onImagesChangeRef.current?.(payload);
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
    const payload: TImages = images
      .filter((img) => img.status === "success")
      .map((img, i) => ({ image: img.gcsURL!, isPrimary: i === index }));
    onImagesChangeRef.current?.(payload);
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
    if (skipRemoteDelete) {
      // Source image belongs to the record being duplicated — never
      // touch it on GCS, just free up the slot for a new upload.
      const updatedImages: TImages = images
        .filter((_, i) => i !== index)
        .filter((img) => img.status === "success")
        .map((img, i) => ({ image: img.gcsURL!, isPrimary: i === 0 }));

      removeImage(index);
      onImagesChangeRef.current?.(updatedImages);
      return;
    }
    if (image.gcsURL) setDeleteTarget({ imageUrl: image.gcsURL, index });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia({ imageUrl: deleteTarget.imageUrl });

      const deletedIdx = deleteTarget.index;
      const newPrimaryIdx =
        primaryImageIndex === deletedIdx
          ? 0
          : deletedIdx < primaryImageIndex
            ? primaryImageIndex - 1
            : primaryImageIndex;

      const updatedImages: TImages = images
        .filter((_, i) => i !== deletedIdx)
        .filter((img) => img.status === "success")
        .map((img, i) => ({
          image: img.gcsURL!,
          isPrimary: i === newPrimaryIdx,
        }));

      removeImage(deleteTarget.index);
      onImagesChangeRef.current?.(updatedImages);
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

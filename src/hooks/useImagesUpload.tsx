import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

import { convertToWebP, uploadWithProgress } from "@/helpers";
import {
  useCreateSignedUrlMutation,
  useDeleteMediaMutation,
} from "@/store/api/mediaMutationApi";

interface UseImagesUploadProps {
  initialImages?: IImage[];
  onChange: (images: TImages) => void;
}

export const useImagesUpload = ({
  initialImages = [],
  onChange,
}: UseImagesUploadProps) => {
  const { t } = useTranslation("toast");
  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia, { isLoading: isImageDeleting }] =
    useDeleteMediaMutation();

  const imagesRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<IImageUpload[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<IDeleteTarget | null>(null);

  /* ---------------- Hydrate existing images ---------------- */
  useEffect(() => {
    if (!initialImages?.length || images?.length) return;

    const hasPrimary = initialImages?.some((img) => img.isPrimary);

    const hydrated = initialImages?.map((img, index) => ({
      id: Date.now() + index,
      previewUrl: img.image,
      progress: 100,
      status: "success",
      isPrimary: img.isPrimary || (!hasPrimary && index === 0),
      gcsURL: img.image,
    }));

    setImages(hydrated);
    setPrimaryImageIndex(hydrated.findIndex((i) => i.isPrimary) || 0);
  }, [initialImages, images?.length]);

  /* ---------------- File select ---------------- */
  const handleImageUpload = (files: FileList) => {
    const newImages: IImageUpload[] = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "idle",
      isPrimary: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    imagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- Signed URL ---------------- */
  const generateSignedUrl = async (imageFile: {
    name: string;
    type: string;
  }) => {
    const res = await createSignedUrl([
      {
        originalName: imageFile!.name,
        mimeType: imageFile!.type,
      },
    ]);

    return res.data[0];
  };

  /* ---------------- Upload single ---------------- */
  const uploadImage = async (id: number) => {
    const image = images.find((i) => i.id === id);
    if (!image?.file) return;
    toast.info(t("image_upload_info"));

    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: "uploading", progress: 0 } : img,
        ),
      );

      const webpFile = await convertToWebP(image.file);
      const { signedUrl, gcsURL } = await generateSignedUrl(webpFile);

      await uploadWithProgress(webpFile, signedUrl, (progress) => {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, progress } : img)),
        );
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, status: "success", progress: 100, gcsURL }
            : img,
        ),
      );

      toast.success(t("image_upload_success"));
    } catch {
      toast.error(t("image_upload_failed"));
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, status: "error" } : img)),
      );
    }
  };

  /* ---------------- Upload all ---------------- */
  const uploadAll = async (): Promise<IImageUpload[]> => {
    let current = [...images];

    for (const img of current) {
      if (img.status === "success" || !img.file) continue;

      try {
        setImages((prev) =>
          prev.map((m) =>
            m.id === img.id ? { ...m, status: "uploading", progress: 0 } : m,
          ),
        );

        const webpFile = await convertToWebP(img.file);
        const { signedUrl, gcsURL } = await generateSignedUrl(webpFile);

        await uploadWithProgress(webpFile, signedUrl, (progress) => {
          setImages((prev) =>
            prev.map((m) => (m.id === img.id ? { ...m, progress } : m)),
          );
        });

        const uploaded: IImageUpload = {
          ...img,
          status: "success",
          progress: 100,
          gcsURL,
        };
        current = current.map((m) => (m.id === img.id ? uploaded : m));
        setImages((prev) => prev.map((m) => (m.id === img.id ? uploaded : m)));

        toast.success(t("image_upload_success"));
      } catch {
        toast.error(t("image_upload_failed"));
        current = current.map((m) =>
          m.id === img.id ? { ...m, status: "error" } : m,
        );
        setImages((prev) =>
          prev.map((m) => (m.id === img.id ? { ...m, status: "error" } : m)),
        );
      }
    }

    return current;
  };

  /* ---------------- Primary image ---------------- */
  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  };

  /* ---------------- Remove image ---------------- */
  const removeImage = (index: number) => {
    const newPrimaryIndex =
      primaryImageIndex === index
        ? 0
        : index < primaryImageIndex
          ? primaryImageIndex - 1
          : primaryImageIndex;

    setImages((prev) => {
      const img = prev[index];
      if (img?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
      return prev
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, isPrimary: i === newPrimaryIndex }));
    });

    setPrimaryImageIndex(newPrimaryIndex);
  };

  /*--------------- Delete Image Locally - If not uploaded yet ------------------ */
  const handleDeleteImage = async (image: IImageUpload, index: number) => {
    if (image.status !== "success") {
      removeImage(index);
      return;
    }
    if (image?.gcsURL) setDeleteTarget({ imageUrl: image.gcsURL, index });
  };

  /*--------------- Delete Image File from Storage - If already uploaded ------------------ */
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

  /* ---------------- Sync payload ---------------- */
  useEffect(() => {
    const payload: TImages = images
      .filter((img) => img.status === "success")
      .map((img) => ({
        image: img.gcsURL!,
        isPrimary: img.isPrimary,
      }));

    onChange(payload);
  }, [images, onChange]);

  return {
    images,
    imagesRef,
    primaryImageIndex,
    setImages,
    handleImageUpload,
    uploadImage,
    uploadAll,
    setPrimaryImage,
    isImageDeleting,
    handleDeleteImage,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  };
};

const PartnersPage = () => {
  /* ---------------- Partner Handlers ---------------- */

  // const handlePartnerAdd = useCallback(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     partners: [
  //       ...prev.partners,
  //       {
  //         id: crypto.randomUUID(),
  //         name: "",
  //         description: "",
  //         logo: "",
  //         website: "",
  //       },
  //     ],
  //   }));
  // }, []);

  // const handlePartnerRemove = useCallback((id: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     partners: prev.partners.filter((p) => p.id !== id),
  //   }));
  // }, []);

  // const handlePartnerChange = useCallback(
  //   (id: string, field: keyof PartnerItem, value: string) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       partners: prev.partners.map((p) =>
  //         p.id === id ? { ...p, [field]: value } : p,
  //       ),
  //     }));
  //   },
  //   [],
  // );

  // /* ---------------- Partner Logo Upload ---------------- */

  // const handlePartnerLogoUpload = useCallback(
  //   async (partnerId: string, file: File) => {
  //     const previewUrl = URL.createObjectURL(file);
  //     setFormData((prev) => ({
  //       ...prev,
  //       partners: prev.partners.map((p) =>
  //         p.id === partnerId ? { ...p, logo: previewUrl } : p,
  //       ),
  //     }));

  //     try {
  //       const webpFile = await convertToWebP(file);
  //       const res = await createSignedUrl([
  //         { originalName: webpFile.name, mimeType: webpFile.type },
  //       ]);
  //       const { signedUrl, gcsURL } = res.data[0];

  //       await uploadWithProgress(webpFile, signedUrl, (p) =>
  //         setUploadProgress((prev) => ({ ...prev, [partnerId]: p })),
  //       );

  //       URL.revokeObjectURL(previewUrl);
  //       setUploadProgress((prev) => {
  //         const next = { ...prev };
  //         delete next[partnerId];
  //         return next;
  //       });
  //       setFormData((prev) => ({
  //         ...prev,
  //         partners: prev.partners.map((p) =>
  //           p.id === partnerId ? { ...p, logo: gcsURL } : p,
  //         ),
  //       }));
  //       toast.success(t("logo_uploaded"));
  //     } catch {
  //       setUploadProgress((prev) => {
  //         const next = { ...prev };
  //         delete next[partnerId];
  //         return next;
  //       });
  //       toast.error(t("logo_upload_failed"));
  //     }
  //   },
  //   [createSignedUrl],
  // );

  return <div>PartnersPage</div>;
};

export default PartnersPage;

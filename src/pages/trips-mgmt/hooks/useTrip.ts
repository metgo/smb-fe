import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { routes } from "@/lib/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useCommon } from "@/hooks/useCommon";
import {
  useCreateTripMutation,
  useUpdateTripMutation,
} from "@/store/api/tripsMutationApi";
import {
  useGetAllStationsQuery,
  useGetTripByIdQuery,
} from "@/store/api/tripsQueryApi";
import {
  setBusinesses,
  setOriginalStations,
  setSelectedStationList,
  setSelectStations,
  setSelectStationDetails,
  resetSelected,
} from "@/features/stationsSlice";
import { useTripFilters } from "./useTripFilters";
import { skipToken } from "@reduxjs/toolkit/query";
import { getPlainTextFromRichText } from "@/helpers";

export const useTrip = ({
  onClose,
  onPublishSuccess,
}: {
  onClose: () => void;
  onPublishSuccess?: () => void;
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isTraveller } = useUserRoles();

  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("id");

  const { t: ct } = useTranslation("common");
  const { t: ft } = useTranslation("trips");
  const { t: tt } = useTranslation("toast");

  const [, setClickedStation] = useState<IClickedStationProps>();
  const [isShowSelectedRouteChecked, setIsShowSelectedRouteChecked] =
    useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("<p></p>");
  const [shortDescription, setshortDescription] = useState("<p></p>");
  const [tripDetails, setTripDetails] = useState<ITripDetailsRes | undefined>(
    undefined,
  );
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { title: "", startTime: null, endTime: null },
  ]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("details");

  const [selectedDmoId, setSelectedDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState<string[]>(
    [],
  );

  const { allWebsites } = useCommon();
  const hasAssociatedWebsites = useMemo(
    () =>
      (allWebsites ?? []).some(
        (site: IWebsite) =>
          (selectedDmoId && site.dmoIds?.includes(selectedDmoId)) ||
          (selectedAuthorityId &&
            site.authorityIds?.includes(selectedAuthorityId)),
      ),
    [allWebsites, selectedDmoId, selectedAuthorityId],
  );

  const businesses = useAppSelector((state) => state.stations.businesses);
  const originalStations = useAppSelector(
    (state) => state.stations.originalStations,
  );
  const selectedStationList = useAppSelector(
    (state) => state.stations.selectedStationList,
  );
  const selectedStations = useAppSelector(
    (state) => state.stations.selectedStations,
  );
  const selectedStationDetails = useAppSelector(
    (state) => state.stations.selectedStationDetails,
  );

  const {
    isPoiChecked,
    activeCategoryIds,
    setIsPoiChecked,

    isBusinessChecked,
    setIsBusinessChecked,
    selectedSubCategoryIds,
    selectedGroupTypeIds,
    selectedAccessibilityIds,
    isMyAreaChecked,
  } = useTripFilters();

  const [formData, setFormData] = useState<{
    name: string | null;
    estimatedDuration: number | null;
    status: string;
    totalDistanceCovered: number | null;
    contactName: string;
    contactPhoneNumber: string;
    contactEmail: string;
  }>({
    name: null,
    estimatedDuration: null,
    status: "PENDING",
    totalDistanceCovered: null,
    contactName: "",
    contactPhoneNumber: "",
    contactEmail: "",
  });

  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();
  const isSubmitting = isCreating || isUpdating;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!selectedDmoId) newErrors.dmo = ct("required_field");
        if (!selectedAuthorityId) newErrors.authority = ct("required_field");
        if (!formData.name?.trim()) newErrors.name = ct("required_field");
        if (!shortDescription.replace(/<[^>]*>/g, "").trim())
          newErrors.shortDescription = ct("required_field");
        if (!formData.estimatedDuration)
          newErrors.estimatedDuration = ct("required_field");
        if (hasAssociatedWebsites && !websiteVisibilityIds?.length)
          newErrors.websiteVisibilityIds = ft("website_visibility_required");
        break;

      case 2:
        if (!selectedStationDetails?.length)
          newErrors.stations = ct("required_field");
        break;

      case 4:
        if (!selectedImages?.length) newErrors.images = ct("required_field");
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (!selectedDmoId || !selectedAuthorityId) {
      toast.error(ct("dmo_authority_select_info_text"));
      return;
    }

    if (!formData?.name || !formData?.estimatedDuration) {
      setSelectedTab("details");
      toast.error(ft("required_fields_missing"));
      return;
    }

    if (hasAssociatedWebsites && !websiteVisibilityIds?.length) {
      setSelectedTab("details");
      toast.error(ft("website_visibility_required"));
      return;
    }

    if (!shortDescription.replace(/<[^>]*>/g, "").trim()) {
      setSelectedTab("details");
      toast.error(ct("required_field"));
      return;
    }

    if (shortDescription.replace(/<[^>]*>/g, "").length > 150) {
      setSelectedTab("details");
      toast.error(ft("short_description_length_exceeded"));
      return;
    }

    if (description.replace(/<[^>]*>/g, "").length > 500) {
      setSelectedTab("details");
      toast.error(ft("description_length_exceeded"));
      return;
    }

    if (!selectedStationDetails?.length) {
      setSelectedTab("stations");
      toast.error(ft("stationsTooltip"));
      return;
    }

    if (!selectedImages?.length) {
      setSelectedTab("image");
      toast.error(ft("imagesTooltip"));
      return;
    }

    const status = isDraft ? "DRAFT" : isTraveller ? "PENDING" : "APPROVED";

    const contactDetails: ITripContactDetails = {};
    if (formData.contactName.trim()) contactDetails.name = formData.contactName;
    if (formData.contactPhoneNumber.trim())
      contactDetails.phoneNumber = formData.contactPhoneNumber;
    if (formData.contactEmail.trim())
      contactDetails.email = formData.contactEmail;

    const payload: ITripPayload = {
      description,
      shortDescription,
      dmoId: selectedDmoId,
      authorityId: selectedAuthorityId,
      name: formData.name,
      status: status as TStatus,
      estimatedDuration: Number(formData.estimatedDuration),
      totalDistanceCovered: Number(formData.totalDistanceCovered) || 0,
      isTrip: true,
      associatedWebsiteIds: websiteVisibilityIds,
      ...(Object.keys(contactDetails).length ? { contactDetails } : {}),
      images: selectedImages.map((image) => ({
        image: image.image,
        alt: image.alt,
        isPrimary: image.isPrimary,
        stationId: image.stationId ?? "",
      })),
      itenary: schedules.map((schedule) => ({
        title: schedule.title,
        startTime: schedule.startTime ?? "",
        endTime: schedule.endTime ?? "",
      })),
      stations: selectedStationDetails?.map((station, index) => {
        return {
          _id: station._id,
          order: index + 1,
          type: "businesses",
        };
      }),
    };

    try {
      if (tripId) {
        await updateTrip({ body: payload, tripId: tripId }).unwrap();
      } else {
        await createTrip(payload).unwrap();
      }

      toast.success(
        tripId ? tt("trip_updated_success") : tt("trip_created_success"),
      );

      if (!isDraft) {
        onClose();
        onPublishSuccess?.();
        // Only navigate if not called from details page (onPublishSuccess provided)
        if (!onPublishSuccess) {
          navigate(routes.tripsMgmt);
        }
      }
    } catch (err: any) {
      toast.error(tt("trip_create_failed"));
    }
  };

  useEffect(() => {
    dispatch(resetSelected());
  }, []);

  const {
    data: stationsData,
    isFetching,
    isLoading,
  } = useGetAllStationsQuery(
    selectedDmoId || selectedAuthorityId
      ? { dmoId: selectedDmoId, authorityId: selectedAuthorityId }
      : skipToken,
  );

  useEffect(() => {
    if (!selectedAuthorityId || !selectedDmoId) return;

    const data = stationsData?.data ?? [];

    const uniqueSelected = selectedStationList.filter(
      (selected) => !data.some((item: any) => item._id === selected._id),
    );

    const mergedData = [...data, ...uniqueSelected];

    dispatch(setBusinesses(mergedData));
    dispatch(setOriginalStations(mergedData));
  }, [stationsData]);

  useEffect(() => {
    if (!isBusinessChecked && !isPoiChecked) {
      setIsBusinessChecked(true);
      setIsPoiChecked(true);
    }
  }, [isBusinessChecked, isPoiChecked]);

  useEffect(() => {
    if (isShowSelectedRouteChecked) {
      const filteredStations = businesses?.filter((business) =>
        selectedStationDetails?.some(
          (station) => station?._id === business?._id,
        ),
      );
      dispatch(setBusinesses(filteredStations));
    } else {
      dispatch(setBusinesses(originalStations));
    }
  }, [isShowSelectedRouteChecked]);

  const { data: tripDetailsData } = useGetTripByIdQuery(
    tripId ? tripId : skipToken,
  );

  useEffect(() => {
    if (tripDetailsData) {
      setTripDetails(tripDetailsData);
    }
  }, [tripDetailsData]);

  useEffect(() => {
    if (tripDetails && tripId) {
      setDescription(getPlainTextFromRichText(tripDetails?.description));
      setshortDescription(
        getPlainTextFromRichText(tripDetails?.shortDescription),
      );
      setFormData({
        name: tripDetails.name,
        estimatedDuration: tripDetails.estimatedDuration || null,
        status: tripDetails.status || "PENDING",
        totalDistanceCovered: tripDetails.totalDistanceCovered || null,
        contactName: tripDetails.contactDetails?.name || "",
        contactPhoneNumber: tripDetails.contactDetails?.phoneNumber || "",
        contactEmail: tripDetails.contactDetails?.email || "",
      });
      setSelectedDmoId(tripDetails?.dmoId);
      setSelectAuthorityId(tripDetails?.authorityId);
      setWebsiteVisibilityIds(tripDetails?.associatedWebsiteIds || []);
      setSelectedImages(tripDetails?.images);
      setSchedules(tripDetails?.itenary);
      if (tripDetails?.stations?.[0]?._id !== null) {
        dispatch(
          setSelectStationDetails(
            (tripDetails?.stations?.map((station) => {
              return {
                _id: station?._id,
                name: station?.name,
                shortDescription: station?.shortDescription || "",
                images: tripDetails.images?.filter(
                  (item) => item.stationId === station._id,
                ),
              };
            }) as IStationDetailsProps[]) || [],
          ),
        );
        dispatch(
          setSelectStations(
            tripDetails?.stations?.map((item) => {
              return {
                stationId: item?._id,
                geoLocation: item?.geoLocation,
              };
            }) || [],
          ),
        );
        const stationIdsFromTrip = tripDetails?.stations?.map(
          (item) => item?._id,
        );
        const matchedStations = originalStations?.filter((station) =>
          stationIdsFromTrip?.includes(station?._id),
        );
        dispatch(setSelectedStationList(matchedStations));
      }
    }
  }, [tripDetails]);

  useEffect(() => {
    setIsShowSelectedRouteChecked(false);
  }, [
    isBusinessChecked,
    isMyAreaChecked,
    isPoiChecked,
    selectedAccessibilityIds,
    selectedGroupTypeIds,
    selectedSubCategoryIds,
    activeCategoryIds,
  ]);

  return {
    handleSubmit,
    handleInputChange,
    validateStep,
    errors,
    setErrors,
    formData,
    stationsData,
    setClickedStation,
    selectedStations,
    selectedStationDetails,

    isShowSelectedRouteChecked,
    setIsShowSelectedRouteChecked,
    activeCategoryIds,
    description,
    setDescription,
    shortDescription,
    setshortDescription,
    selectedTab,
    setSelectedTab,
    schedules,
    setSchedules,
    selectedImages,
    setSelectedImages,
    isSubmitting,

    selectedDmoId,
    setSelectedDmoId,
    selectedAuthorityId,
    setSelectAuthorityId,
    websiteVisibilityIds,
    setWebsiteVisibilityIds,

    isLoading,
    isFetching,
  };
};

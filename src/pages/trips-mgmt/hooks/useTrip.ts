import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
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

export const useTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isRTL: isHebrew } = useThemeClasses();
  const { t: commonText } = useTranslation("common");
  const { t: fundayText } = useTranslation("funday");
  const id = searchParams.get("id");

  const [, setClickedStation] = useState<IClickedStationProps>();
  const [isShowSelectedRouteChecked, setIsShowSelectedRouteChecked] =
    useState(false);
  const [description, setDescription] = useState("<p></p>");
  const [shortDescription, setshortDescription] = useState("<p></p>");
  const [tripDetails, setTripDetails] = useState<ITripDetails | undefined>(
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

  const dispatch = useAppDispatch();
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
  console.log("🚀 ~ useTrip ~ selectedStationDetails:", selectedStationDetails);

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
  }>({
    name: null,
    estimatedDuration: null,
    status: "PENDING",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDmoId || !selectedAuthorityId) {
      toast.error(commonText("dmo_authority_select_info_text"));
      return;
    }

    if (!formData?.name || !formData?.estimatedDuration || !formData?.status) {
      setSelectedTab("details");
      toast.error(fundayText("required_fields_missing"));
      return;
    }

    if (!selectedStationDetails?.length) {
      setSelectedTab("stations");
      toast.error(fundayText("stationsTooltip"));
      return;
    }

    if (!selectedImages?.length) {
      setSelectedTab("image");
      toast.error(fundayText("imagesTooltip"));
      return;
    }

    const payload = {
      description,
      shortDescription,
      dmoId: selectedDmoId,
      authorityId: selectedAuthorityId,
      name: formData.name,
      status: formData.status,
      estimatedDuration: Number(formData.estimatedDuration),
      isTrip: true,
      images: selectedImages,
      itenary: schedules,
      stations: selectedStationDetails?.map((station, index) => {
        return {
          _id: station._id,
          order: index + 1,
          type: "businesses",
        };
      }),
    };

    try {
      if (id) {
        await updateTrip({ body: payload, tripId: id }).unwrap();
      } else {
        await createTrip(payload).unwrap();
      }

      toast(id ? "Trip updated successfully!" : "Trip created successfully!");
      navigate(routes.tripsMgmt);
    } catch (err: any) {
      toast.error(err?.data?.message?.[0] || "Failed to create Trip");
    }
  };

  useEffect(() => {
    dispatch(resetSelected());
  }, []);

  // const stationsQueryParams = (() => {
  //   if (
  //     !(
  //       activeCategoryIds ||
  //       searchTerm ||
  //       isBusinessChecked ||
  //       isPoiChecked ||
  //       isMyAreaChecked ||
  //       selectedDmoId ||
  //       selectedAuthorityId
  //     )
  //   ) {
  //     return null;
  //   }

  //   let params = ``;
  //   if (searchTerm) params += `&search=${searchTerm}`;
  //   if (selectedDmoId) params += `&dmoId=${selectedDmoId}`;
  //   if (selectedAuthorityId) params += `&authorityId=${selectedAuthorityId}`;
  //   if (user?.role === UserRole.AUTHORITY) params += `&isMyArea=true`;

  //   const serviceTypeOnlyBusiness = isBusinessChecked && !isPoiChecked;
  //   const serviceTypeOnlyPoi = !isBusinessChecked && isPoiChecked;

  //   if (serviceTypeOnlyBusiness) {
  //     params += `&serviceType=business`;
  //   } else if (serviceTypeOnlyPoi) {
  //     params += `&serviceType=point_of_interest`;
  //   }

  //   if (isMyAreaChecked) {
  //     params += `&isMyArea=${isMyAreaChecked}`;
  //   }

  //   return params;
  // })();

  const { data: stationsData } = useGetAllStationsQuery(
    selectedDmoId && selectedAuthorityId
      ? { dmoId: selectedDmoId, authorityId: selectedAuthorityId }
      : skipToken,
  );

  useEffect(() => {
    if (!selectedAuthorityId && !selectedDmoId) return;

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
    { tripId: id },
    { skip: !id },
  );

  useEffect(() => {
    if (tripDetailsData) {
      setTripDetails(tripDetailsData);
    }
  }, [tripDetailsData]);

  useEffect(() => {
    if (tripDetails && id) {
      setDescription(tripDetails?.description);
      setshortDescription(tripDetails?.shortDescription);
      setFormData({
        name: tripDetails.name,
        estimatedDuration: tripDetails.estimatedDuration || null,
        status: tripDetails.status || "PENDING",
      });
      setSelectedImages(tripDetails?.images);
      setSchedules(tripDetails?.itenary);
      if (tripDetails?.stations?.[0]?._id !== null) {
        dispatch(
          setSelectStationDetails(
            (tripDetails?.stations?.map((station) => {
              return {
                _id: station?._id?._id,
                name: station?._id?.name,
                shortDescription: station?._id?.shortDescription || "",
                images: station?._id?.images || [],
                logo: station?._id?.logo || {},
              };
            }) as IStationDetailsProps[]) || [],
          ),
        );
        dispatch(
          setSelectStations(
            tripDetails?.stations?.map((item) => {
              return {
                stationId: item?._id?._id,
                geoLocation: item?._id?.geoLocation,
              };
            }) || [],
          ),
        );
        const stationIdsFromTrip = tripDetails?.stations?.map(
          (item) => item?._id?._id,
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
    isHebrew,
    handleSubmit,
    handleInputChange,
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
  };
};

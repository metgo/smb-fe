import clsx from "clsx";
import { Globe, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { ImageWithFallback, ConfirmDialog } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  setSelectedStationList,
  setSelectStations,
  setSelectStationDetails,
  setStationDetails,
} from "@/features/stationsSlice";

const TripRouteStations = () => {
  const { t } = useTranslation("trips");
  const { isRTL, bgPrimary, bgSecondary, textPrimary } = useThemeClasses();
  const dispatch = useAppDispatch();

  const selectedStationList = useAppSelector(
    (state) => state.stations.selectedStationList,
  );
  const selectedStations = useAppSelector(
    (state) => state.stations.selectedStations,
  );
  const selectedStationDetails = useAppSelector(
    (state) => state.stations.selectedStationDetails,
  );

  const [stations, setStations] = useState(selectedStationDetails || []);
  const [deleteStationId, setDeleteStationId] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const reordered = [...stations];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setStations(reordered);
    dispatch(setSelectStationDetails(reordered));

    // Reorder selectedStations based on reordered station IDs
    const newOrder = reordered.map((station) => station._id);
    const reorderedSelected = newOrder
      .map((id) => selectedStations.find((sel) => sel.stationId === id))
      .filter(Boolean); // remove any undefined in case of mismatch

    dispatch(setSelectStations(reorderedSelected as typeof selectedStations));
  };

  useEffect(() => {
    setStations(selectedStationDetails || []);
  }, [selectedStationDetails]);

  function handleDeleteStationClick(id: string) {
    setDeleteStationId(id);
  }

  function handleDeleteStation() {
    if (deleteStationId) {
      const updatedStations = stations?.filter(
        (station) => station._id !== deleteStationId,
      );
      setStations(updatedStations);
      dispatch(setSelectStationDetails(updatedStations));
      const updatedSelectedStations = selectedStations?.filter(
        (station) => station?.stationId !== deleteStationId,
      );
      dispatch(setSelectStations(updatedSelectedStations));
      const updatedSelectedStationList = selectedStationList?.filter(
        (station) => station?._id !== deleteStationId,
      );
      dispatch(setSelectedStationList(updatedSelectedStationList));
    }
    setDeleteStationId(null);
  }

  function handleSationDetailsShow(item: IStationDetailsProps) {
    dispatch(setStationDetails(item));
  }

  return (
    <>
      <div className={clsx(bgSecondary)}>
        <h3 className={clsx("font-bold text-xl mb-2", textPrimary)}>
          {t("stations")}
        </h3>

        <div className="h-[60vh] overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stations">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 border border-gray-200 rounded-md p-1"
                >
                  {stations.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-10 px-4 text-gray-500">
                      <Globe size={18} />
                      <p className="text-sm font-medium">
                        {t("station_not_selected_yet")}
                      </p>
                    </div>
                  )}

                  {stations?.map((item, index: number) => (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleSationDetailsShow(item)}
                          className={clsx(
                            bgPrimary,
                            "rounded-md p-3 flex items-center gap-2 cursor-pointer relative",
                          )}
                        >
                          <ImageWithFallback
                            width={60}
                            height={60}
                            src={
                              item?.images?.[0]?.image ||
                              "/assets/img/image-placeholder.jpg"
                            }
                            alt={item?.images?.[0]?.alt}
                            className="object-cover rounded-[12px] h-15 w-15"
                          />
                          <div className={clsx(textPrimary, "w-full mt-3")}>
                            <h2 className="font-bold text-[14px] line-clamp-1">
                              {item.name}
                            </h2>
                            <div
                              className="text-[12px] line-clamp-1"
                              dangerouslySetInnerHTML={{
                                __html: item?.shortDescription,
                              }}
                            />
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStationClick(item._id);
                            }}
                            className={`w-6 h-6 rounded-full bg-red-600 flex items-center justify-center absolute top-2 ${isRTL ? "left-2" : "right-2"} cursor-pointer transition-all duration-100 hover:h-7 hover:w-7`}
                          >
                            <Trash2 className="text-white" size={14} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteStationId}
        title="delete_station"
        message="delete_station_confirm"
        confirmText="delete"
        variant="danger"
        onCancel={() => setDeleteStationId(null)}
        onConfirm={handleDeleteStation}
      />
    </>
  );
};

export default TripRouteStations;

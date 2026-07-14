import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { ImageWithFallback } from '@/components/shared';
import { Globe, Trash2 } from 'lucide-react';
import { ModalWrapper } from '@/components/wrapper';
import { useTranslation } from 'react-i18next';
import { useThemeClasses } from '@/hooks/useThemeClasses';


interface TripRouteStationsProps {
  setIsOpen: (v: boolean) => void;
}


const TripRouteStations = ({ setIsOpen }:TripRouteStationsProps) => {
  const { t } = useTranslation('trips');
  const { isRTL } = useThemeClasses();
  const {
    selectedStationList,
    selectedStations,
    selectedStationDetails,
    setSelectedStationList,
    setSelectStations,
    setSelectStationDetails,
    setStationDetails,
  } = useStationsStore();


  const [stations, setStations] = useState(selectedStationDetails || []);
  const [deleteStationId, setDeleteStationId] = useState<string | null>(null);
  const [isStationDeleteModalOpen, setIsStationDeleteModalOpen] =
    useState(false);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const reordered = [...stations];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setStations(reordered);
    setSelectStationDetails(reordered);

    // Reorder selectedStations based on reordered station IDs
    const newOrder = reordered.map((station) => station._id);
    const reorderedSelected = newOrder
      .map((id) => selectedStations.find((sel) => sel.stationId === id))
      .filter(Boolean); // remove any undefined in case of mismatch

    setSelectStations(reorderedSelected as typeof selectedStations);
  };

  useEffect(() => {
    setStations(selectedStationDetails || []);
  }, [selectedStationDetails]);

  function handleDeleteStationClick(id: string) {
    setDeleteStationId(id);
    setIsStationDeleteModalOpen(true);
  }

  function handleDeleteStation() {
    if (deleteStationId) {
      const updatedStations = stations?.filter(
        (station) => station._id !== deleteStationId
      );
      setStations(updatedStations);
      setSelectStationDetails(updatedStations);
      const updatedSelectedStations = selectedStations?.filter(
        (station) => station?.stationId !== deleteStationId
      );
      setSelectStations(updatedSelectedStations);
      setIsStationDeleteModalOpen(false);
      const updatedSelectedStationList = selectedStationList?.filter(
        (station) => station?._id !== deleteStationId
      );
      setSelectedStationList(updatedSelectedStationList);
    }
  }

  function handleSationDetailsShow(item) {
    setStationDetails(item);
    setIsBusinessCardModalOpen(true);
  }

  return (
    <>
      <div className="bg-white rounded-[12px]">
        <h3 className="font-bold text-xl mb-2">{t('stations')}</h3>

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
                        {t('station_not_selected_yet')}
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
                          className="bg-[#F4F7F5] rounded-md p-3 flex items-center gap-2 cursor-pointer relative"
                        >
                          <ImageWithFallback
                            width={60}
                            height={60}
                            src={
                              item?.images?.[0]?.image ||
                              '/assets/img/image-placeholder.jpg'
                            }
                            alt={item?.images?.[0]?.alt}
                            className="object-cover rounded-[12px] h-[60px] w-[60px]"
                          />
                          <div className="w-full mt-3">
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
                            className={`w-6 h-6 rounded-full bg-eventGreen flex items-center justify-center absolute top-2 ${isHebrew ? 'left-2' : 'right-2'} cursor-pointer transition-all duration-100 hover:h-7 hover:w-7`}
                          >
                            <Trash2 className="text-white" />
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

      {/* Delete Confirmation Dialog */}
      {isStationDeleteModalOpen && (
        <ModalWrapper onClose={() => setIsStationDeleteModalOpen(false)}>
          <div>
            <div className="text-[20px] text-center font-bold">
              {t('tripAccountDeleteInfo')}
            </div>
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={handleDeleteStation}
                className="bg-red-500 px-4 py-2 text-white rounded-md"
              >
                {t('delete')}
              </button>
              <button
                type="button"
                onClick={() => setIsStationDeleteModalOpen(false)}
                className="border border-gray-900 px-4 py-2 rounded-md"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

export default TripRouteStations;

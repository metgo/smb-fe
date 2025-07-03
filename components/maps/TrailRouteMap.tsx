import { useGoogleMap } from "@/hooks/useGoogleMap";

const TrailRouteMap = () => {
  const { mapRef } = useGoogleMap();

  return (
    <div className={`w-full h-[95vh]`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default TrailRouteMap;

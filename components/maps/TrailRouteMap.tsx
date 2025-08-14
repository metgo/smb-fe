import { useGoogleRouteMap } from "@/hooks/map/useGoogleRouteMap";

const TrailRouteMap = ({ className }: { className: string }) => {
  const { mapRef } = useGoogleRouteMap();

  return (
    <div className={`${className} h-[95vh]`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default TrailRouteMap;

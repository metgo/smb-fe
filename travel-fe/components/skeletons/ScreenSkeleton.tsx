import { misc } from "@/constant/hebrew";

const ScreenSkeleton = ({ isLoading = false }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="w-full h-screen bg-black/40 z-50 absolute top-0 left-0 flex items-center justify-center ">
      <div className="font-bold text-white text-2xl">
        {misc.pleaseWait} ....
      </div>
    </div>
  );
};

export default ScreenSkeleton;

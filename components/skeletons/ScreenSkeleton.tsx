const ScreenSkeleton = ({ isLoading = false }: { isLoading: boolean }) => {
  return (
    isLoading && (
      <div className="w-full h-screen bg-black/40 z-50 ">
        <div>Please wait....</div>
      </div>
    )
  );
};

export default ScreenSkeleton;

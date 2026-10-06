const SplashLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-yellow-400 via-red-500 to-green-600">
      <div className="w-60 h-60 rounded-full flex items-center justify-center bg-blur-2xl bg-black/10  p-2 border border-white/60">
        <img
          src="/assets/images/nati_icon_color.svg"
          alt="Logo"
          className="w-40 animate-pulse"
        />
      </div>
    </div>
  );
};

export default SplashLoader;

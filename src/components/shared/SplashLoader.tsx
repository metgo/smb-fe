const SplashLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-yellow-400 via-red-500 to-green-600">
      <img
        src="/assets/images/metgo-logo.png"
        alt="Logo"
        className="w-40 animate-pulse"
      />
    </div>
  );
};

export default SplashLoader;

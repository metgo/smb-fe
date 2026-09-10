interface LightboxViewerProps {
  lightboxUrl: string;
  onClose: () => void;
}

export const LightboxViewer: React.FC<LightboxViewerProps> = ({
  lightboxUrl,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
    onClick={onClose}
  >
    <img
      src={lightboxUrl}
      className="max-w-full max-h-full rounded shadow-2xl"
      alt=""
    />
  </div>
);

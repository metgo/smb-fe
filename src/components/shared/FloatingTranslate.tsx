import TranslateButton from "./TranslateButton";

export default function FloatingTranslate() {
  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Floating Card */}
      <div className="bg-white shadow-lg rounded-full px-3 py-2 border flex items-center gap-2">
        <TranslateButton />
      </div>
    </div>
  );
}

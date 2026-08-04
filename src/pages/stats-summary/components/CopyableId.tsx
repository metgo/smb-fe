import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface CopyableIdProps {
  id: string;
}

export const CopyableId = ({ id }: CopyableIdProps) => {
  const { isDark } = useThemeClasses();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md text-xs font-mono transition-all ${
        isDark
          ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
      } ${copied ? (isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-600") : ""}`}
      title={copied ? "Copied!" : "Click to copy ID"}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      <span className="max-w-20 truncate">{id}</span>
    </button>
  );
};

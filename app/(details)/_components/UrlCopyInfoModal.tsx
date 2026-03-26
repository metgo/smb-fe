"use client";

import { misc } from "@/constant/hebrew";
import { Link } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onClose: () => void;
}

const UrlCopyInfoModal = ({ onClose }: Props) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl shadow-2xl p-8 bg-white flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
          <Link className="w-8 h-8 text-teal-600" />
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {misc.linkCopied}
          </h3>
          <p className="text-gray-500 text-sm">{misc.shareLink}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-base transition-colors cursor-pointer shadow-md hover:shadow-lg"
        >
          {misc.close}
        </button>
      </motion.div>
    </div>
  );
};

export default UrlCopyInfoModal;

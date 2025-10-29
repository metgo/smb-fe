"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

import { Dialog, IconImage } from "./ui";
import { misc } from "@/constant/hebrew";
import { googleSendGtmEvent, triggerName } from "@/lib/googleEventsConfig";

const ShareUrlBtnModal = ({
  hideShareText = false,
}: {
  hideShareText?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      googleSendGtmEvent(triggerName.clickToShareUrl, { shareUrl: url });
      await navigator.clipboard.writeText(url);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  return (
    <>
      <div
        onClick={handleCopy}
        className={clsx(
          hideShareText ? "" : "flex items-center gap-1.25 ps-2.5 pe-4 py-1",
          "custom-cursor max-sm:hidden md:block ",
        )}
      >
        <IconImage icon={"share"} />
        {!hideShareText && (
          <span className="font-bold text-theme text-sm">{misc.sharing}</span>
        )}
      </div>

      {isOpen && (
        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="w-[430px] top-60"
        >
          <div className="font-bold relative overflow-hidden w-full flex flex-col items-center py-16 z-50 rounded-xl">
            <h1 className="text-2xl text-dark">{misc.linkCopied}</h1>
            <p className="text-dark my-1">{misc.shareLink}</p>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-black px-8 py-2 rounded-lg text-white mt-2 cursor-pointer hover:shadow-md"
            >
              {misc.close}
            </button>

            <Image
              width={180}
              height={184}
              alt="Yellow Chrysanthemum"
              src="/images/yellow-chrysanthemum.png"
              className="absolute -left-15 -bottom-20"
            />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ShareUrlBtnModal;

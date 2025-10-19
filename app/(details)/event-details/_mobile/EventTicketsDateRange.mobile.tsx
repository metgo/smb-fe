"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useItemBuyCart } from "@/hooks";
import { misc } from "@/constant/hebrew";
import PriceTag from "@/components/PriceTag";
import { itemTypeEnum, paymentMethodType } from "@/lib/utils";
import { getHebrewDateInfo } from "@/lib/helpers";
import { CardSkeleton } from "@/components/skeletons";
import { IconImage, NextImage } from "@/components/ui";
import { eventDetils } from "@/constant/placeholderData";
import { useImageScale } from "@/hooks/image/useImageScale";
import { useImagePresent } from "@/hooks/image/useImagePresent";
import toast from "react-hot-toast";

const MobileEventTicketsDateRange = ({
  dayDescription,
  payment,
}: EventDetailsProps) => {
  const [tickets, setTickets] = useState<DayDescription | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>(
    dayDescription?.[0]?.date,
  );

  useEffect(() => {
    if (dayDescription) {
      setTickets(dayDescription?.[0]);
    }
  }, [dayDescription]);

  function handleDaySelection(date: string) {
    setSelectedDate(date);
    const associatedTickets = dayDescription?.find(
      (ticket) => ticket.date === date,
    );
    setTickets(associatedTickets);
  }

  const { scale } = useImageScale();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart, quickPurchase } = useItemBuyCart();

  return (
    <>
      <div className="col-span-4 flex flex-col items-center  gap-6 my-4">
        <div className="flex items-center gap-2.5 overflow-x-auto flex-nowrap w-full px-4">
          {dayDescription?.map((item) => {
            const eventInfo = getHebrewDateInfo(item.date);
            const isActive = item.date === selectedDate;

            return (
              <div
                key={item._id}
                onClick={() => handleDaySelection(item.date)}
                className={`min-w-[94px] h-27 border rounded-[5px] flex flex-col items-center justify-center font-normal ${
                  isActive
                    ? "text-white bg-black"
                    : "border-[#D3D3D3] text-theme"
                }`}
              >
                <span>{eventInfo.days}</span>
                <div
                  className={`font-bold text-[2.5rem] leading-none ${
                    isActive ? "text-white" : "text-charcoal"
                  }`}
                >
                  {eventInfo.day}
                </div>
                <span>{eventInfo.month}</span>
              </div>
            );
          })}
        </div>

        {/* External link redirection */}
        {payment?.method === paymentMethodType.externalLink && (
          <>
            <Link
              href={payment?.externalLink}
              target="_blank"
              className="bg-dark rounded-2xl ps-15 pe-16.5 py-2 text-white flex items-center gap-1.25 font-bold custom-cursor"
            >
              <IconImage icon="external-link" />
              <span>{misc.enrollment}</span>
            </Link>
            <p className="text-theme font-normal text-[12px] text-center">
              {eventDetils.dateline}
            </p>
          </>
        )}

        {/* Tickets section */}
        {payment?.method === paymentMethodType.ticket && (
          <section
            className={`flex gap-4 mt-1 px-4 overflow-x-auto max-sm:scroll-smooth  max-sm:snap-mandatory scrollbar-hide w-full ${
              tickets?.ticketIds?.length === 1 ? "justify-center" : ""
            }`}
          >
            {tickets?.ticketIds?.map((product) => (
              <div
                key={product._id}
                className="flex-shrink-0 snap-start max-sm:w-[240px] sm:w-auto relative"
              >
                <div className="h-[330px] custom-cursor rounded-2xl overflow-hidden border border-[#D3D3D3]">
                  <div className="relative w-full overflow-hidden">
                    <div
                      // style={{ width: 242 * scale, height: 224 * scale }}
                      className="relative max-sm:h-[142px] md:h-[242px] w-full"
                    >
                      <AnimatePresence mode="sync" initial={false}>
                        {product?.images?.map((imageItem, index) =>
                          index === activeImageIndex ? (
                            <ImageCard
                              key={index}
                              scale={scale}
                              imageItem={imageItem}
                              primaryCategoryId={""}
                            />
                          ) : null,
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Controls & indicators */}
                    {product?.images?.length > 1 && (
                      <div className="absolute bottom-1 left-0 flex items-center justify-between px-4 mb-3.5 w-full">
                        <div className="w-10" />
                        <div className="flex items-center gap-1">
                          {product?.images?.map((_: any, index: number) => (
                            <div
                              key={index}
                              className={`transition-all duration-300 rounded-full bg-white ${index === activeImageIndex ? "w-2 h-2" : "w-2 h-2 opacity-50"}`}
                            />
                          ))}
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveImageIndex(
                              (prev) => (prev + 1) % product?.images?.length,
                            );
                          }}
                          className="custom-cursor"
                        >
                          <IconImage width={30} height={30} icon="prev" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="m-4">
                    <h3 className="text-dark font-bold line-clamp-1">
                      {product?.name}
                    </h3>
                    <div
                      className="line-clamp-2 text-theme text-[12px] h-8.5 font-normal"
                      dangerouslySetInnerHTML={{ __html: product?.description }}
                    />
                    <PriceTag
                      price={product?.price?.sellingPrice}
                      className="text-[32px] text-dark font-normal my-2.5"
                    />

                    <div className="flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={(e) =>
                          quickPurchase(e, product, itemTypeEnum.ticket)
                        }
                        className="h-10 rounded-xl bg-dark text-white flex items-center justify-center w-full flex-auto custom-cursor font-bold text-lg"
                      >
                        <span>{misc.quickPurchase}</span>
                      </button>
                      <div
                        onClick={(e) => {
                          addToCart(e, product, 1, itemTypeEnum.ticket);
                          toast.success("הכרטיס נוסף בהצלחה", {
                            style: {
                              color: "#fff",
                              background: "#111",
                              marginTop: "60px",
                            },
                          });
                        }}
                        className="flex-none custom-cursor hover:shadow-md rounded-xl"
                      >
                        <IconImage
                          width={40}
                          height={40}
                          icon="circular-cart"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
};

const ImageCard = ({
  imageItem,
  scale,
  primaryCategoryId,
}: {
  imageItem: ImageItem;
  scale: number;
  primaryCategoryId: string;
}) => {
  const aspectRatio = 242 / 224;
  const { isLoading, updatedImage, isImageLoaded } = useImagePresent(
    aspectRatio,
    imageItem,
    0,
    [imageItem],
    {
      threshold: 0.1,
      rootMargin: "50px",
      enabled: false,
    },
  );

  if (isLoading || !isImageLoaded)
    return (
      <CardSkeleton
        className={"rounded-t-2xl w-full h-full"}
        primaryCategoryId={primaryCategoryId}
      />
    );

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0, ease: "easeInOut" }}
      className="absolute top-0 left-0 h-full w-full"
    >
      <NextImage
        isFill
        width={242}
        height={224}
        scale={scale}
        alt={updatedImage.alt}
        imgSrc={updatedImage.imageUrl}
        className="w-full object-cover"
      />
    </motion.div>
  );
};

export default MobileEventTicketsDateRange;

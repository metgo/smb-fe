"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconImage } from "@/components/ui";
import { deliveries } from "@/constant/hebrew";
import { devlieryInfoMapData } from "@/lib/utils";

// Helper components
const DeliveryTitleLayout = ({
  icon,
  title,
  desc,
  className = "py-7.5",
  children,
}: {
  icon: string;
  title: string;
  desc?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <div className={`border border-secondary rounded-[10px] ${className}`}>
    <div className="flex items-center gap-2.5">
      <IconImage icon={icon} />
      <h2 className="font-bold text-sm text-dark">{title}</h2>
    </div>
    <div
      className="text-sm font-normal text-theme mt-2.5"
      dangerouslySetInnerHTML={{ __html: desc || "" }}
    />
    {children}
  </div>
);

const DeliveryLocationPrice = ({
  location,
  price,
  isLast = false,
}: {
  location: string;
  price: string;
  isLast?: boolean;
}) => (
  <div>
    <div className="flex items-center justify-between text-sm py-4 px-2">
      <span className="text-theme">{location}</span>
      <span className="text-charcoal">₪{price}</span>
    </div>
    {!isLast && <hr className="text-secondary" />}
  </div>
);

// Main component
const DeliveriesContent = ({
  deliveryArea,
  deliveryReturnExchange,
  deliveryAdditionalInfo,
  deliverySpecificSellerInfo,
}: DeliverySectionProps) => {
  const sections: ReactNode[] = [];

  if (deliveryArea?.length > 0) {
    sections.push(
      <DeliveryTitleLayout
        key="area"
        icon="delivery-truck"
        title={deliveries.homeDelivery}
        desc="שליח עד הבית 3-7 ימי עסקים"
        className="px-6.5 py-7.5 h-max"
      >
        <div className="mt-5">
          {deliveryArea.map((item, index) => (
            <DeliveryLocationPrice
              key={index}
              location={item.area}
              price={item.price}
              isLast={deliveryArea.length - 1 === index}
            />
          ))}
        </div>
      </DeliveryTitleLayout>,
    );
  }

  if (deliverySpecificSellerInfo?.length > 0) {
    sections.push(
      <DeliveryTitleLayout
        key="store"
        icon="shop"
        title={deliveries.pickupFromTheStore}
        className="pt-7.5 pb-0 ps-6.5 pe-0 h-37"
      >
        <div className="h-20 overflow-y-auto">
          {deliverySpecificSellerInfo.map((str, index) => (
            <div key={index}>
              {devlieryInfoMapData[str as keyof typeof devlieryInfoMapData]}
            </div>
          ))}
        </div>
      </DeliveryTitleLayout>,
    );
  }

  if (deliveryReturnExchange?.length > 0) {
    sections.push(
      <DeliveryTitleLayout
        key="return"
        icon="packag-return"
        title={deliveries.exchangeAndReturns}
        className="pt-7.5 pb-0 ps-6.5 pe-0 h-37"
      >
        <div className="h-20 overflow-y-auto no-scrollbar-arrows">
          {deliveryReturnExchange.map((str, index) => (
            <div key={index}>
              {devlieryInfoMapData[str as keyof typeof devlieryInfoMapData]}
            </div>
          ))}
        </div>
      </DeliveryTitleLayout>,
    );
  }

  if (deliveryAdditionalInfo) {
    sections.push(
      <DeliveryTitleLayout
        key="info"
        icon="circular-plus"
        title={deliveries.additionalInformation}
        className="pt-7.5 pb-0 ps-6.5 pe-0 h-37"
      >
        <div className="max-h-80 overflow-y-scroll no-scrollbar-arrows">
          <p>{deliveryAdditionalInfo}</p>
        </div>
      </DeliveryTitleLayout>,
    );
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSwipeable = sections.length > 1 && width <= 400;

  return (
    <div className="sm:hidden" ref={containerRef}>
      <motion.div
        className="flex overflow-hidden"
        drag={isSwipeable ? "x" : false}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (!isSwipeable) return;
          if (info.offset.x < -50 && activeIndex < sections.length - 1) {
            setActiveIndex((prev) => prev + 1);
          } else if (info.offset.x > 50 && activeIndex > 0) {
            setActiveIndex((prev) => prev - 1);
          }
        }}
        animate={{ x: -activeIndex * width }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {sections.map((section, index) => (
          <div key={index} className="min-w-full flex-shrink-0 px-4">
            {section}
          </div>
        ))}
      </motion.div>

      {/* indicator */}
      {sections.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {sections.map((_, i) => (
            <span
              key={i}
              onClick={() => setActiveIndex(i)}
              className={` rounded-full ${
                i === activeIndex ? "bg-dark h-3 w-3" : "bg-gray-300 h-2 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveriesContent;

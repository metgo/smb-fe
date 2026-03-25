"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { IconImage } from "@/components/ui";
import { deliveries } from "@/constant/hebrew";
import { devlieryInfoMapData } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/helpers";

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
  <div
    className={`border border-secondary rounded-[10px] ${className} bg-white w-full flex-shrink-0`}
  >
    <div className="flex items-center gap-2.5">
      <IconImage icon={icon} />
      <h2 className="font-bold text-sm text-dark">{title}</h2>
    </div>
    <div
      className="text-sm font-normal text-theme mt-2.5"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc || "") }}
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

const MobileDeliveriesContent = ({
  deliveryArea,
  deliveryReturnExchange,
  deliveryAdditionalInfo,
  deliverySpecificSellerInfo,
}: DeliverySectionProps) => {
  const sections: ReactNode[] = [];

  // 🧩 Build sections dynamically
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

  // 🧭 Active indicator logic
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const width = el.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      setActiveIndex(newIndex);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative my-8 sm:hidden">
      {/* Scrollable Cards */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth px-4 hide-scrollbar"
      >
        {sections.map((section, index) => (
          <div key={index} className="min-w-full snap-center">
            {section}
          </div>
        ))}
      </div>

      {/* Indicator Dots */}
      {sections.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {sections.map((_, i) => (
            <span
              key={i}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === activeIndex ? "bg-dark h-3 w-3" : "bg-gray-300 h-2 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MobileDeliveriesContent;

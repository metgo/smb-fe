import { IconImage } from "@/components/ui";
import { deliveries } from "@/constant/hebrew";
import React, { ReactNode } from "react";

// Helper components
const DeliveryTitleLayout = ({
  icon,
  title,
  desc,
  hasExtension = false,
  className = "py-7.5",
  children,
}: {
  icon: string;
  title: string;
  desc: string;
  hasExtension?: boolean;
  children?: ReactNode;
  className?: string;
}) => (
  <div className={`border border-secondary rounded-[10px] px-6.5 ${className}`}>
    <div className="flex items-center gap-2.5">
      <IconImage icon={icon} hasExtension={hasExtension} />
      <h2 className="font-bold text-sm text-dark">{title}</h2>
    </div>
    <div
      className="text-sm font-normal text-theme mt-2.5"
      dangerouslySetInnerHTML={{ __html: desc }}
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
  price: number;
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

const DeliveryLocationTime = ({
  location,
  timeStr,
  price,
  isLast,
}: {
  location: string;
  timeStr: string;
  price: number;
  isLast?: boolean;
}) => (
  <div>
    <div className="flex items-center justify-between text-sm py-4 px-2">
      <div className="text-theme">
        <div>{location}</div>
        <div>{timeStr}</div>
      </div>
      <span className="text-charcoal">₪{price}</span>
    </div>
    {!isLast && <hr className="text-secondary" />}
  </div>
);

// Main component
const DeliveriesTabContent = () => {
  return (
    <div className="grid grid-cols-3 gap-7.25">
      <div className="col-span-1">
        <DeliveryTitleLayout
          icon="delivery-truck"
          title={deliveries.homeDelivery}
          desc="שליח עד הבית 3-7 ימי עסקים"
        >
          <div className="mt-5">
            <DeliveryLocationPrice location="תל אביב יפו" price={19.9} />
            <DeliveryLocationPrice location="חיפה והקריות" price={19.9} />
            <DeliveryLocationPrice location="ירושלים והסביבה" price={19.9} />
            <DeliveryLocationPrice
              location="אילת והמערבה"
              price={19.9}
              isLast
            />
          </div>
        </DeliveryTitleLayout>
      </div>
      <div className="col-span-1">
        <DeliveryTitleLayout
          icon="shopping-bag.png"
          hasExtension
          title={deliveries.selfPickupPoint}
          desc="לאחר אישור ההזמנה ניתן לאסוף תוך יום עסקים"
          className="pt-7.5 pb-0"
        >
          <div className="mt-5 max-h-[240px] overflow-y-scroll">
            <DeliveryLocationTime
              location="בן יהודה 17, תל אביב"
              timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
              price={1}
            />
            <DeliveryLocationTime
              location="ארלוזורוב 56, תל אביב"
              timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
              price={0}
            />
            <DeliveryLocationTime
              location="שד ירושלים 34, תל אביב"
              timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
              price={2}
            />
            <DeliveryLocationTime
              location="נס ציונה 355, תל אביב"
              timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
              price={5}
              isLast
            />
          </div>
        </DeliveryTitleLayout>
      </div>
      <div className="col-span-1 space-y-6.75">
        <DeliveryTitleLayout
          icon="shop"
          title={deliveries.pickupFromTheStore}
          desc={`<p>
            לאחר אישור ההזמנה ובתיאום עם החנות<br/>
            ללא תשלום נוסף
            </p>`}
        />

        <DeliveryTitleLayout
          icon="packag-return"
          title={deliveries.exchangeAndReturns}
          desc={`<p>
            החלפה עד 30 ימי עסקים<br/>
            החזר כספי עד 14 ימי עסקים
            </p>`}
        />
      </div>
    </div>
  );
};

export default DeliveriesTabContent;

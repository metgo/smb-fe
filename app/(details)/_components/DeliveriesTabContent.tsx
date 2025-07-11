import { ReactNode } from "react";
import { IconImage } from "@/components/ui";
import { deliveries } from "@/constant/hebrew";

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
      dangerouslySetInnerHTML={{ __html: desc! }}
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

// const DeliveryLocationTime = ({
//   location,
//   timeStr,
//   price,
//   isLast,
// }: {
//   location: string;
//   timeStr: string;
//   price: number;
//   isLast?: boolean;
// }) => (
//   <div>
//     <div className="flex items-center justify-between text-sm py-4 px-2">
//       <div className="text-theme">
//         <div>{location}</div>
//         <div>{timeStr}</div>
//       </div>
//       <span className="text-charcoal">₪{price}</span>
//     </div>
//     {!isLast && <hr className="text-secondary" />}
//   </div>
// );

// Main component

const DeliveriesTabContent = ({
  deliveryArea,
  deliveryReturnExchange,
  deliveryAdditionalInfo,
  deliverySpecificSellerInfo,
}: BusinessDetailsProps) => {
  return (
    <div className="grid grid-cols-3 gap-7.25">
      {deliveryArea?.length > 0 && (
        <div className="col-span-1">
          <DeliveryTitleLayout
            icon="delivery-truck"
            title={deliveries.homeDelivery}
            desc="שליח עד הבית 3-7 ימי עסקים"
            className="px-6.5 py-7.5 h-[29rem]"
          >
            <div className="mt-5">
              {deliveryArea?.map((item, index) => (
                <DeliveryLocationPrice
                  key={index}
                  location={item.area}
                  price={item.price}
                  isLast={deliveryArea.length - 1 === index}
                />
              ))}
            </div>
          </DeliveryTitleLayout>
        </div>
      )}

      {
        // <div className="col-span-1">
        //   <DeliveryTitleLayout
        //     icon="shopping-bag"
        //     title={deliveries.selfPickupPoint}
        //     desc="לאחר אישור ההזמנה ניתן לאסוף תוך יום עסקים"
        //     className="pt-7.5 pb-0 ps-6.5 pe-0 h-[29rem]"
        //   >
        //     <div className="mt-5">
        //       <DeliveryLocationTime
        //         location="בן יהודה 17, תל אביב"
        //         timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
        //         price={1}
        //       />
        //       <DeliveryLocationTime
        //         location="ארלוזורוב 56, תל אביב"
        //         timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
        //         price={0}
        //       />
        //       <DeliveryLocationTime
        //         location="שד ירושלים 34, תל אביב"
        //         timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
        //         price={2}
        //       />
        //       <DeliveryLocationTime
        //         location="נס ציונה 355, תל אביב"
        //         timeStr="א׳-ה׳ 8:00-2:00 ו׳ 9:00-12:00"
        //         price={5}
        //         isLast
        //       />
        //     </div>
        //   </DeliveryTitleLayout>
        // </div>
      }

      <div className="col-span-1 space-y-2.5 text-sm font-normal text-theme">
        {deliverySpecificSellerInfo?.length > 0 && (
          <DeliveryTitleLayout
            icon="shop"
            title={deliveries.pickupFromTheStore}
            className="pt-7.5 pb-0 ps-6.5 pe-0 h-37"
          >
            <div className="max-h-20 overflow-y-scroll">
              {deliverySpecificSellerInfo?.map((str, index) => (
                <div key={index}>{str}</div>
              ))}
            </div>
          </DeliveryTitleLayout>
        )}

        {deliveryReturnExchange?.length > 0 && (
          <DeliveryTitleLayout
            icon="packag-return"
            title={deliveries.exchangeAndReturns}
            className="pt-7.5 pb-0 ps-6.5 pe-0 h-37"
          >
            <div className="max-h-20 overflow-y-scroll no-scrollbar-arrows">
              {deliveryReturnExchange?.map((str, index) => (
                <div key={index}>{str}</div>
              ))}
            </div>
          </DeliveryTitleLayout>
        )}

        {deliveryAdditionalInfo && (
          <DeliveryTitleLayout
            icon="circular-plus"
            title={deliveries.additionalInformation}
            className="pt-7.5 pb-0 ps-6.5 pe-0 h-37"
          >
            <div className="max-h-80 overflow-y-scroll no-scrollbar-arrows">
              <p>{deliveryAdditionalInfo}</p>
            </div>
          </DeliveryTitleLayout>
        )}
      </div>
    </div>
  );
};

export default DeliveriesTabContent;

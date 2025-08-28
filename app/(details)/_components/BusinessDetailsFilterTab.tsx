"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { menuItems } from "@/constant/hebrew";
import OurStoryTabContent from "./OurStoryTabContent";
import ProductsTabContent from "./ProductsTabContent";
import DeliveriesTabContent from "./DeliveriesTabContent";

const tabs = [
  { id: 1, label: menuItems.ourStory },
  { id: 2, label: menuItems.products },
  { id: 3, label: menuItems.deliveries },
];

const BusinessDetailsFilterTab = ({
  businessDetails,
  products,
}: {
  businessDetails: BusinessDetailsProps;
  products: Product[];
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [updatedTabs, setUpdatedTabs] = useState<typeof tabs>([]);

  const rederTabContent = () => {
    switch (activeTab) {
      case 1:
        return <OurStoryTabContent {...businessDetails} />;
      case 2:
        return (
          <ProductsTabContent
            products={products}
            primaryCategoryId={businessDetails?.primaryCategoryId}
          />
        );
      case 3:
        return <DeliveriesTabContent {...businessDetails} />;
      default:
        return null;
    }
  };

  function handleTabChange(id: number) {
    setActiveTab(id);
    window.scrollTo({ top: 650, left: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const hasProducts = products?.length > 0;
    const hasDeliveryInfo =
      businessDetails?.deliveryAdditionalInfo ||
      businessDetails?.deliveryArea?.length > 0 ||
      businessDetails?.deliveryReturnExchange?.length > 0 ||
      businessDetails?.deliverySpecificSellerInfo?.length > 0;
    let updatedTabItems = [...tabs];

    if (!hasProducts && !hasDeliveryInfo) {
      updatedTabItems = tabs.filter((item) => item.id === 1);
    } else {
      if (!hasProducts) {
        updatedTabItems = updatedTabItems.filter((item) => item.id !== 2);
      }
      if (!hasDeliveryInfo) {
        updatedTabItems = updatedTabItems.filter((item) => item.id !== 3);
      }
    }

    setUpdatedTabs(updatedTabItems);
  }, [businessDetails, products]);

  return (
    <div className="mt-15">
      <div className="flex items-center gap-12 relative">
        {updatedTabs.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="custom-cursor text-dark w-max mb-2.5"
            >
              <div
                className={`relative inline-block ${isActive ? "font-bold" : "font-normal"}`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 -bottom-2.5 h-[3px] w-full bg-dark rounded-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <hr className="w-full h-[1px] text-secondary mb-15" />

      {rederTabContent()}
    </div>
  );
};

export default BusinessDetailsFilterTab;

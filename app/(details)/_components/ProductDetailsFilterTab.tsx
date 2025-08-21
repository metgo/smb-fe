"use client";

import { useEffect, useState } from "react";

import { Tabs } from "@/components/ui";
import { menuItems } from "@/constant/hebrew";
import DeliveriesTabContent from "./DeliveriesTabContent";
import ProductDescriptionTabContent from "./ProductDescriptionTabContent";

const tabs = [
  { id: 1, label: menuItems.productDescription },
  { id: 2, label: menuItems.deliveries },
];

const ProductDetailsFilterTab = ({
  deliveryArea,
  deliverySpecificSellerInfo,
  deliveryReturnExchange,
  deliveryAdditionalInfo,
  description,
}: ProductDetailsProps) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [updatedTabs, setUpdatedTabs] = useState<typeof tabs>([]);

  useEffect(() => {
    const hasDeliveryInfo =
      deliveryAdditionalInfo ||
      deliveryArea?.length > 0 ||
      deliveryReturnExchange?.length > 0 ||
      deliverySpecificSellerInfo?.length > 0;
    let updatedTabItems = [...tabs];

    if (!hasDeliveryInfo) {
      updatedTabItems = updatedTabItems.filter((item) => item.id !== 2);
    }

    setUpdatedTabs(updatedTabItems);
  }, [
    deliveryAdditionalInfo,
    deliveryArea,
    deliverySpecificSellerInfo,
    deliveryReturnExchange,
  ]);

  const rederTabContent = () => {
    switch (activeTab) {
      case 1:
        return <ProductDescriptionTabContent description={description} />;
      case 2:
        return (
          <DeliveriesTabContent
            deliveryArea={deliveryArea}
            deliveryAdditionalInfo={deliveryAdditionalInfo}
            deliverySpecificSellerInfo={deliverySpecificSellerInfo}
            deliveryReturnExchange={deliveryReturnExchange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-15">
      <Tabs
        tabs={updatedTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {rederTabContent()}
    </div>
  );
};

export default ProductDetailsFilterTab;

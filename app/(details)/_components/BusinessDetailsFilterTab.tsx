"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui";
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
}: {
  businessDetails: BusinessDetailsProps;
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const rederTabContent = () => {
    switch (activeTab) {
      case 1:
        return <OurStoryTabContent {...businessDetails} />;
      case 2:
        return <ProductsTabContent {...businessDetails} />;
      case 3:
        return <DeliveriesTabContent {...businessDetails} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-15">
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      {rederTabContent()}
    </div>
  );
};

export default BusinessDetailsFilterTab;

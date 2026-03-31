"use client";
import { motion } from "framer-motion";

interface TabsProps {
  tabs: {
    id: number;
    label: string;
  }[];
  activeTab: number;
  setActiveTab: (activeTab: number) => void;
}

const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
  function handleTabChange(id: number) {
    setActiveTab(id);
    window.scrollTo({ top: 650, left: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="flex items-center gap-12 relative">
        {tabs.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="custom-cursor  w-max mb-2.5"
            >
              <div
                className={`relative inline-block ${isActive ? "font-bold" : "font-normal"}`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 -bottom-2.5 w-full  rounded-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <hr className="w-full h-[1px] text-secondary mb-15" />
    </>
  );
};

export default Tabs;

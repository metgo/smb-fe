interface TabSelectorProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const TabSelector = ({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps) => (
  <div className="flex items-center gap-4 bg-black/10 shadow w-max p-1 rounded-md">
    {tabs.map((item, index) => (
      <button
        key={index}
        type="button"
        onClick={() => onTabChange(index)}
        className={`${
          activeTab === index ? "bg-white font-bold" : "font-normal"
        } px-4 py-2 custom-cursor rounded-md`}
      >
        {item}
      </button>
    ))}
  </div>
);

import clsx from "clsx";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

type Props = {
  data: IDmo[];
};

const DmoAuthorityies: React.FC<Props> = ({ data }) => {
  const { selectInputClasses } = useThemeClasses();
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const selectedParent = data?.find((item) => item._id === selectedParentId);
  const selectedChild = selectedParent?.authorities?.find(
    (child) => child._id === selectedChildId,
  );

  return (
    <div className="flex gap-4">
      {/* Parent Dropdown */}
      <div className="flex items-center gap-2">
        {selectedParent?.logoPath && (
          <div className="flex flex-col items-center h-20 w-20">
            <img
              src={selectedParent.logoPath}
              alt={selectedParent.name}
              className="w-full h-full object-contain rounded"
            />
          </div>
        )}
        <div className="flex gap-2 relative">
          <select
            value={selectedParentId}
            onChange={(e) => {
              setSelectedParentId(e.target.value);
              setSelectedChildId("");
            }}
            className={clsx(
              "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-45",
              selectInputClasses,
            )}
          >
            <option value="">Select DMO</option>
            {data?.map((parent) => (
              <option key={parent._id} value={parent._id}>
                {parent.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Child Dropdown */}
      <div className="flex items-center gap-4">
        <div className=" relative">
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className={clsx(
              "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-45",
              selectInputClasses,
            )}
          >
            <option value="">Select Authority</option>
            {selectedParent?.authorities?.map((child) => (
              <option key={child._id} value={child._id}>
                {child.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        {selectedChild?.logoPath && (
          <div className="flex flex-col items-center w-12 h-12">
            <img
              src={selectedChild.logoPath}
              alt={selectedChild.name}
              className="w-full h-full object-contain rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DmoAuthorityies;

import { useState } from "react";

import { ReactSelect } from "../form-fields";

type Props = {
  data: IDmo[];
};

const DmoAuthorityies: React.FC<Props> = ({ data }) => {
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const selectedParent = data?.find((item) => item._id === selectedParentId);

  return (
    <div className="flex gap-4">
      {/* Parent Dropdown */}
      <ReactSelect
        value={selectedParentId}
        onChange={setSelectedParentId}
        placeholder="Select DMO"
        items={data?.map((item) => ({
          _id: item._id,
          name: item.name,
          logo: item?.logoPath || "",
        }))}
      />

      <ReactSelect
        value={selectedChildId}
        onChange={setSelectedChildId}
        placeholder="Select Authority"
        items={selectedParent?.authorities?.map((item) => ({
          _id: item._id,
          name: item.name,
          logo: item?.logoPath,
        }))}
      />
    </div>
  );
};

export default DmoAuthorityies;

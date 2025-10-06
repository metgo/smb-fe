import { termsConditions } from "@/constant/siteInfo";
import React from "react";

const page = () => {
  return (
    <div className="px-40 font-normal py-20">
      <h1 className="text-center font-bold underline">תקנון אתר</h1>

      <div className="px-10 py-6 text-right leading-relaxed">
        {termsConditions.map((section, index) => (
          <div key={index} className="mb-6">
            <div className="flex gap-2 font-bold border-b mb-2 w-max">
              <span>{index + 1}</span>
              <h2>{section.title}</h2>
            </div>
            <div className="custom-counter list-none ps-2">
              {section.points.map((point, idx) => (
                <div key={idx} className="flex gap-2">
                  <span>
                    {index + 1}.{idx + 1}
                  </span>
                  <p key={idx} className="mb-2">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;

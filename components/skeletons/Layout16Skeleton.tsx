import { onlyCardsColumns, onlyCardsLayouts, REFERENCE_SCREEN_WIDTH } from "@/constant/collageLayouts";
import { scaleLayout } from "@/lib/helpers";
import { categoryGradientClasses } from "@/lib/utils"
import { useEffect, useState } from "react";



const Layout16Skeleton = ({
  primaryCategoryId = "6566e31ca77d2a477266d2d6"
}:
  { primaryCategoryId?: string }
) => {

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);

  return (
    <div className="flex justify-center gap-5 flex-wrap">
      {Object.values(onlyCardsColumns.layout16).map((indexes, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-5">
          {indexes.map((i) => {
            const { width, height } = layout16[i]
            return (
              <div
                key={i}
                className={`rounded-2xl skeleton ${categoryGradientClasses[primaryCategoryId]}`}
                style={{ width, height }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Layout16Skeleton
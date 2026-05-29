import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface SectionHeaderProps {
  title: string;
  subTitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subTitle }) => {
  const { isDark } = useThemeClasses();
  return (
    <div>
      <h2
        className={clsx(
          "text-xl sm:text-2xl font-bold",
          isDark ? "text-white" : "text-gray-900",
        )}
      >
        {title}
      </h2>
      <p
        className={clsx(
          "text-sm mt-1",
          isDark ? "text-gray-400" : "text-gray-600",
        )}
      >
        {subTitle}
      </p>
    </div>
  );
};

export default SectionHeader;

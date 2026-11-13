import clsx from "clsx";
import { Edit } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface EditIconBtnProps {
  onClick: (e: any) => void;
}

const EditIconBtn: React.FC<EditIconBtnProps> = ({ onClick }) => {
  const { isDark } = useThemeClasses();
  return (
    <button
      title="Edit"
      className={clsx(
        "p-1 rounded-md transition-colors bg-blue-500/20 text-blue-400",
        isDark ? " hover:text-blue-400" : " hover:text-blue-600",
      )}
      onClick={(e) => onClick(e)}
    >
      <Edit size={16} />
    </button>
  );
};

export default EditIconBtn;

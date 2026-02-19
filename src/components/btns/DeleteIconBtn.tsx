import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DeleteIconBtnProps {
  onClick: (e: any) => void;
}

const DeleteIconBtn: React.FC<DeleteIconBtnProps> = ({ onClick }) => {
  const { isDark } = useThemeClasses();

  return (
    <button
      title="Delete"
      onClick={(e) => onClick(e)}
      className={clsx(
        "p-1 rounded-md transition-colors bg-red-500/20 hover:bg-red-500/40  text-red-400",
        isDark ? " hover:text-red-400" : " hover:text-red-600",
      )}
    >
      <Trash2 size={16} />
    </button>
  );
};

export default DeleteIconBtn;

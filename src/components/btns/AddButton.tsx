import { Plus } from "lucide-react"

interface AddButtonProps {
  label: string;
  handleClick: ()=>void;
}


const AddButton = ({ label, handleClick }: AddButtonProps) => {

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default AddButton;

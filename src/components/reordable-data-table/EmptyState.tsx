import { SearchX } from "lucide-react";

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 select-none h-full">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-inner">
      <SearchX className="w-7 h-7 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 tracking-wide">
      {message}
    </p>
  </div>
);

export default EmptyState;
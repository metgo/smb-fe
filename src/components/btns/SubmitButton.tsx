import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  className: string;
  onClick?: ()=>void;
  type?: "submit" | "reset" | "button" | "reset";
}

const SubmitButton = ({ loading, label, className, type = "submit", onClick }: SubmitButtonProps) => (
  <Button
    type={type}
    disabled={loading}
    onClick={onClick && onClick}
    className={clsx(
      className,
      loading ? "cursor-not-allowed" : "cursor-pointer",
      "w-full transition-colors flex items-center justify-center gap-2"
    )}
  >
    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
    {label}
  </Button>
);
export default SubmitButton
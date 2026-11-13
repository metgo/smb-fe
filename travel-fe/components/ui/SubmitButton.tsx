import Spinner from "./Spinner";

type SubmitButtonProps = {
  label: string;
  isDisabled: boolean;
  isLoading?: boolean;
};

const SubmitButton = ({
  isDisabled,
  label,
  isLoading = false,
}: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isDisabled || isLoading}
      className={`px-4 py-2 font-normal rounded-md 
                   ${
                     isDisabled
                       ? "bg-black/20 text-white cursor-not-allowed"
                       : "bg-black text-white custom-cursor"
                   }`}
    >
      {isLoading ? <Spinner /> : label}
    </button>
  );
};

export default SubmitButton;

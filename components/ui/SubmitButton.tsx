type SubmitButtonProps = {
  label: string;
  isDisabled: boolean;
};

const SubmitButton = ({ isDisabled, label }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`px-4 py-2 font-normal rounded-md 
                   ${
                     isDisabled
                       ? "bg-black/20 text-white cursor-not-allowed"
                       : "bg-black text-white cursor-pointer"
                   }`}
    >
      {label}
    </button>
  );
};

export default SubmitButton;

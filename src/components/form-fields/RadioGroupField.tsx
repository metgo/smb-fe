interface RadioGroupFieldProps<T extends string> {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  labelMapper: (v: T) => string;
  textSecondary: string;
}

const RadioGroupField = <T extends string>({
  value,
  options,
  onChange,
  labelMapper,
  textSecondary,
}: RadioGroupFieldProps<T>) => {
  return (
    <div className="flex flex-wrap gap-6">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <input
            type="radio"
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-5 h-5 text-teal-500 focus:ring-teal-500 focus:ring-2"
          />
          <span
            className={`text-base capitalize font-medium ${textSecondary} group-hover:text-teal-500`}
          >
            {labelMapper(opt)}
          </span>
        </label>
      ))}
    </div>
  );
};
export default RadioGroupField;

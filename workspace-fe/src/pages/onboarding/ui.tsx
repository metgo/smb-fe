import clsx from "clsx";
import { forwardRef } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

/** Small form primitives in the Workspace look (teal focus ring, gray borders). */

interface FieldProps {
  id: string;
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({
  id,
  label,
  optionalLabel,
  hint,
  error,
  children,
}: FieldProps) {
  const { textSecondary, textTertiary } = useThemeClasses();
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className={clsx("block text-sm font-medium", textSecondary)}
      >
        {label}
        {optionalLabel && (
          <span className={clsx("ms-1 font-normal text-xs", textTertiary)}>
            ({optionalLabel})
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${id}-hint`}
            className={clsx("text-xs leading-5", textTertiary)}
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const useInputClass = (invalid?: boolean) => {
  const { inputClasses } = useThemeClasses();
  return clsx(
    "w-full px-4 py-2.5 rounded-lg border text-base md:text-sm transition-colors focus:outline-none focus:ring-2",
    inputClasses,
    invalid
      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
      : "focus:ring-teal-500 focus:border-teal-500",
  );
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, id, ...rest }, ref) => (
    <input
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : `${id}-hint`}
      className={clsx(useInputClass(invalid), className)}
      {...rest}
    />
  ),
);
TextInput.displayName = "TextInput";

type AreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(
  ({ invalid, className, id, ...rest }, ref) => (
    <textarea
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      className={clsx(
        useInputClass(invalid),
        "min-h-36 resize-y leading-relaxed",
        className,
      )}
      {...rest}
    />
  ),
);
TextArea.displayName = "TextArea";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const { isDark } = useThemeClasses();
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        isDark
          ? "focus-visible:ring-offset-gray-900"
          : "focus-visible:ring-offset-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-teal-600 text-white hover:bg-teal-700",
        variant === "outline" &&
          (isDark
            ? "border border-teal-500/60 text-teal-300 hover:bg-teal-900/30"
            : "border border-teal-600 text-teal-700 hover:bg-teal-50"),
        variant === "ghost" &&
          (isDark
            ? "text-gray-300 hover:bg-gray-800"
            : "text-gray-600 hover:bg-gray-100"),
        className,
      )}
      {...rest}
    />
  );
}

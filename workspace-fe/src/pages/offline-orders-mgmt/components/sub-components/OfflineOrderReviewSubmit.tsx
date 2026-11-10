import clsx from "clsx";
import { Pencil, Briefcase, Package, User } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatDate } from "@/helpers";

interface OfflineOrderReviewSubmitProps {
  t: (key: string) => string;
  formData: {
    companyName: string;
    employerType: string;
    leadDate: string;
    initialRequest: number | string;
    closedDealValue: number | string;
    dealClosureDate: string;
    vendor: string;
    product: string;
    paymentMethod: string;
    description: string;
    name: string;
    position: string;
    productPrice: number | string;
    desiredQuantity: number | string;
    phone: string;
    email: string;
  };
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const STEPS = {
  BUSINESS: 1,
  PRODUCT: 2,
  CONTACT: 3,
};

const OfflineOrderReviewSubmit = ({
  t,
  formData,
  setCurrentStep,
}: OfflineOrderReviewSubmitProps) => {
  const { textPrimary, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  const sectionCard = clsx("rounded-xl border overflow-hidden", borderColor);

  const sectionHeader = (
    icon: React.ReactNode,
    label: string,
    step: number,
  ) => (
    <div
      className={clsx(
        "flex items-center justify-between px-5 py-3",
        isDark ? "bg-white/5" : "bg-gray-50",
        "border-b",
        borderColor,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={clsx("opacity-60", textSecondary)}>{icon}</span>
        <span
          className={clsx(
            "text-sm font-semibold tracking-wide uppercase",
            textTertiary,
          )}
        >
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setCurrentStep(step)}
        className={clsx(
          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
          isDark
            ? "text-teal-400 hover:bg-teal-950/50"
            : "text-teal-600 hover:bg-teal-50",
        )}
      >
        <Pencil className="w-3 h-3" />
        {t("edit")}
      </button>
    </div>
  );

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs", textTertiary)}>{label}</span>
      <div className={clsx("text-sm font-medium", textPrimary)}>
        {value || "—"}
      </div>
    </div>
  );

  const divider = <div className={clsx("border-t mx-5", borderColor)} />;

  return (
    <div className="space-y-5">
      <div className={sectionCard}>
        {sectionHeader(
          <Briefcase className="w-4 h-4" />,
          t("business_name"),
          STEPS.BUSINESS,
        )}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("business_name"), formData.companyName)}
            {row(t("employer_type"), formData.employerType)}
          </div>
          {divider}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(
              t("lead_date"),
              formData.leadDate ? formatDate(formData.leadDate) : "",
            )}
            {row(
              t("deal_closure_date"),
              formData.dealClosureDate
                ? formatDate(formData.dealClosureDate)
                : "",
            )}
          </div>
          {divider}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(
              t("initial_request"),
              formData.initialRequest ? `₪${formData.initialRequest}` : "",
            )}
            {row(
              t("closed_deal_value"),
              formData.closedDealValue ? `₪${formData.closedDealValue}` : "",
            )}
          </div>
        </div>
      </div>

      <div className={sectionCard}>
        {sectionHeader(
          <Package className="w-4 h-4" />,
          t("product_name"),
          STEPS.PRODUCT,
        )}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("vendor"), formData.vendor)}
            {row(t("product_name"), formData.product)}
          </div>
          {divider}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(
              t("price"),
              formData.productPrice ? `₪${formData.productPrice}` : "",
            )}
            {row(t("quantity"), formData.desiredQuantity)}
          </div>
          {divider}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("payment_method"), formData.paymentMethod)}
          </div>
          {divider}
          {row(t("description"), formData.description)}
        </div>
      </div>

      <div className={sectionCard}>
        {sectionHeader(
          <User className="w-4 h-4" />,
          t("customer_name"),
          STEPS.CONTACT,
        )}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("customer_name"), formData.name)}
            {row(t("position"), formData.position)}
          </div>
          {divider}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("phone"), formData.phone)}
            {row(t("email"), formData.email)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineOrderReviewSubmit;

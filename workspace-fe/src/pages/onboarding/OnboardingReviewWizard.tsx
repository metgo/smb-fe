import { CreateBusinessWizard } from "@/pages/businesses-mgmt/components";
import { useGetbusinessByIdQuery } from "@/store/api/businessQueryApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { IOpMode } from "@/enums/operation.types";
import { Spinner } from "@/components/shared";

/**
 * Opens the regular Add business wizard on the business the onboarding just
 * created, in edit mode, so the vendor reviews every step and publishes.
 */
export default function OnboardingReviewWizard({
  businessId,
  onClose,
  refetch,
}: {
  businessId: string;
  onClose: () => void;
  refetch?: () => void;
}) {
  const { language } = useThemeClasses();
  const {
    data,
    isLoading,
    refetch: refetchBusiness,
  } = useGetbusinessByIdQuery({
    businessId,
    language,
  });

  if (isLoading || !data) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
        <Spinner isLoading />
      </div>
    );
  }

  return (
    <CreateBusinessWizard
      editData={data}
      opMode={IOpMode.EDIT}
      onClose={onClose}
      refetch={refetch}
      businessDataRefetch={refetchBusiness}
    />
  );
}

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Landmark,
  ShieldCheck,
  BadgeCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { ModalWrapper } from "@/components/wrapper";
import { ImageWithFallback } from "@/components/shared";
import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getInitials } from "@/helpers";
import { useGetUserDetailsByEmailQuery } from "@/store/api/userQueryApi";

interface ChatUserProfileProps {
  email: string;
  onClose: () => void;
}

const roleBadgeClasses: Record<string, string> = {
  superadmin:
    "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  authority:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  dmo: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  traveller: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  user: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const ChatUserProfileSkeleton = () => {
  const { isDark, borderColor } = useThemeClasses();
  const bar = isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className="flex flex-col animate-pulse w-full">
      {/* Header / Banner */}
      <div
        className={clsx(
          "px-6 pt-8 pb-6 flex flex-col items-center text-center border-b",
          borderColor,
        )}
      >
        <div className={clsx("w-20 h-20 rounded-full", bar)} />
        <div className={clsx("mt-3 h-5 w-40 rounded-md", bar)} />
        <div className="mt-2.5 flex items-center gap-2">
          <div className={clsx("h-5 w-20 rounded-full", bar)} />
          <div className={clsx("h-5 w-16 rounded-full", bar)} />
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-4 grid grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 ">
            <div className={clsx("w-4 h-4 mt-0.5 rounded shrink-0", bar)} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className={clsx("h-2.5 w-14 rounded-md", bar)} />
              <div className={clsx("h-4 w-2/3 rounded-md", bar)} />
            </div>
          </div>
        ))}
      </div>
      {/* DMO / Authority association */}
      <div
        className={clsx(
          "pt-4 mt-2 border-t space-y-3 grid grid-cols-2 w-full",
          borderColor,
        )}
      >
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border px-3 py-2.5 border-transparent"
          >
            <div className={clsx("w-9 h-9 rounded-lg shrink-0", bar)} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className={clsx("h-2.5 w-16 rounded-md", bar)} />
              <div className={clsx("h-4 w-1/2 rounded-md", bar)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatUserProfile = ({ email, onClose }: ChatUserProfileProps) => {
  const { t } = useTranslation("chat");
  const { data, isFetching, isLoading } = useGetUserDetailsByEmailQuery(email);
  const { dmosAuthorities } = useCommon();
  const { isDark, textPrimary, textTertiary, borderColor, bgSecondary } =
    useThemeClasses();

  const dmo = dmosAuthorities?.find((d) => d._id === data?.dmo?.id);
  const authority = dmo?.authorities?.find(
    (a) => a._id === data?.authority?.id,
  );

  const fullName = data ? `${data.firstName} ${data.lastName}`.trim() : "";
  const showSkeleton = (isLoading || isFetching) && !data;

  return (
    <ModalWrapper
      onClose={onClose}
      maxWidth="max-w-lg"
      height="h-auto md:h-auto"
    >
      {showSkeleton ? (
        <ChatUserProfileSkeleton />
      ) : !data ? (
        <div className="p-10" />
      ) : (
        <div className="flex flex-col">
          {/* Header / Banner */}
          <div
            className={clsx(
              "px-6 pt-8 pb-6 flex flex-col items-center text-center border-b",
              borderColor,
              isDark
                ? "bg-linear-to-b from-teal-950/40 to-transparent"
                : "bg-linear-to-b from-teal-50 to-transparent",
            )}
          >
            <div
              className={clsx(
                "w-20 h-20 rounded-full border-2 shrink-0 flex items-center justify-center font-bold text-2xl",
                borderColor,
                isDark
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {getInitials(fullName)}
            </div>
            <h2 className={clsx("mt-3 text-lg font-bold", textPrimary)}>
              {fullName}
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={clsx(
                  "px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize",
                  roleBadgeClasses[data.role] || roleBadgeClasses.user,
                )}
              >
                {data.role}
              </span>
              {data.isEmailVerify && (
                <span
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full",
                    isDark
                      ? "bg-emerald-900/30 text-emerald-400"
                      : "bg-emerald-50 text-emerald-700",
                  )}
                >
                  <BadgeCheck className="w-3 h-3" />
                  {t("verified")}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="flex items-start gap-3">
                <Mail
                  className={clsx("w-4 h-4 mt-0.5 shrink-0", textTertiary)}
                />
                <div className="min-w-0 flex-1">
                  <p className={clsx("text-xs", textTertiary)}>{t("email")}</p>
                  <div className="flex items-center gap-1.5">
                    <p
                      className={clsx(
                        "text-sm font-medium truncate",
                        textPrimary,
                      )}
                    >
                      {data.email}
                    </p>
                    {data.isEmailVerify ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
              {data.phoneDetails?.phoneNumber && (
                <div className="flex items-start gap-3">
                  <Phone
                    className={clsx("w-4 h-4 mt-0.5 shrink-0", textTertiary)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={clsx("text-xs", textTertiary)}>
                      {t("phone")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p
                        className={clsx(
                          "text-sm font-medium truncate",
                          textPrimary,
                        )}
                      >
                        {data.phoneDetails.countryCode}{" "}
                        {data.phoneDetails.phoneNumber}
                      </p>
                      {data.isPhoneVerify ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {data.address && (
                <div className="flex items-start gap-3">
                  <MapPin
                    className={clsx("w-4 h-4 mt-0.5 shrink-0", textTertiary)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={clsx("text-xs", textTertiary)}>
                      {t("address")}
                    </p>
                    <p className={clsx("text-sm font-medium", textPrimary)}>
                      {data.address}
                    </p>
                  </div>
                </div>
              )}
              {data.createdAt && (
                <div className="flex items-start gap-3">
                  <Calendar
                    className={clsx("w-4 h-4 mt-0.5 shrink-0", textTertiary)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={clsx("text-xs", textTertiary)}>
                      {t("member_since")}
                    </p>
                    <p className={clsx("text-sm font-medium", textPrimary)}>
                      {new Date(data.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* DMO / Authority association */}
            {(dmo || authority) && (
              <div
                className={clsx(
                  "pt-4 mt-2 border-t space-y-3 grid-cols-2 gap-2 md:gap-4",
                  borderColor,
                )}
              >
                {dmo && (
                  <div
                    className={clsx(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                      bgSecondary,
                      borderColor,
                    )}
                  >
                    <ImageWithFallback
                      src={dmo.logoPath}
                      alt={dmo.name}
                      className="w-9 h-9 rounded-lg object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx(
                          "text-[10px] uppercase tracking-wide font-semibold",
                          textTertiary,
                        )}
                      >
                        {t("dmo")}
                      </p>
                      <p
                        className={clsx(
                          "text-sm font-bold truncate",
                          textPrimary,
                        )}
                      >
                        {dmo.name}
                      </p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  </div>
                )}

                {authority && (
                  <div
                    className={clsx(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                      bgSecondary,
                      borderColor,
                    )}
                  >
                    {authority.logoPath ? (
                      <ImageWithFallback
                        src={authority.logoPath}
                        alt={authority.name}
                        className="w-9 h-9 rounded-lg object-contain shrink-0"
                      />
                    ) : (
                      <div
                        className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          isDark ? "bg-gray-800" : "bg-gray-100",
                        )}
                      >
                        <Landmark
                          className={clsx("w-4.5 h-4.5", textTertiary)}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx(
                          "text-[10px] uppercase tracking-wide font-semibold",
                          textTertiary,
                        )}
                      >
                        {t("authority")}
                      </p>
                      <p
                        className={clsx(
                          "text-sm font-bold truncate",
                          textPrimary,
                        )}
                      >
                        {authority.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default ChatUserProfile;

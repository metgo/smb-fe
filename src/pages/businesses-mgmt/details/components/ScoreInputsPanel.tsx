import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, ClipboardList, ShieldAlert } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  useAddPolicyFlagMutation,
  useResolvePolicyFlagMutation,
  useUpdateLocalSourcingMutation,
  useVerifyLocalSourcingMutation,
  type IPolicyFlag,
  type IScoreInputs,
} from "@/store/api/businessScoreApi";

interface Props {
  businessId: string;
  inputs: IScoreInputs;
}

const errorText = (error: unknown, fallback: string) =>
  (
    error as { data?: { message?: string | string[] } }
  )?.data?.message?.toString() || fallback;

// admin inputs that feed the score: warnings/suspensions and the vendor's
// local sourcing details (counted once an admin has checked them)
const ScoreInputsPanel = ({ businessId, inputs }: Props) => {
  const { t, i18n } = useTranslation("score");
  const {
    isDark,
    inputClasses,
    borderColor,
    textPrimary,
    textSecondary,
    textTertiary,
  } = useThemeClasses();
  const { isTraveller } = useUserRoles();
  const isAdmin = !isTraveller;

  const [addFlag, { isLoading: adding }] = useAddPolicyFlagMutation();
  const [resolveFlag] = useResolvePolicyFlagMutation();
  const [saveSourcing, { isLoading: savingSourcing }] =
    useUpdateLocalSourcingMutation();
  const [verifySourcing, { isLoading: verifying }] =
    useVerifyLocalSourcingMutation();

  const [flagType, setFlagType] = useState<IPolicyFlag["type"]>("WARNING");
  const [reason, setReason] = useState("");
  const [percent, setPercent] = useState<string>("");
  const [employees, setEmployees] = useState<string>("");

  const sourcing = inputs.localSourcing;
  useEffect(() => {
    setPercent(sourcing?.localProductsPercent?.toString() ?? "");
    setEmployees(sourcing?.localEmployees?.toString() ?? "");
  }, [sourcing?.localProductsPercent, sourcing?.localEmployees]);

  const activeFlags = inputs.policyFlags.filter((f) => !f.resolvedAt);
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const fieldInput = clsx("px-3 py-2 rounded-lg border text-sm", inputClasses);
  const button = clsx(
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    borderColor,
    textSecondary,
  );

  const summary = [
    activeFlags.length
      ? t("flags_active", { count: activeFlags.length })
      : t("no_active_flags"),
    sourcing?.verifiedAt ? t("sourcing_verified") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <CollapsibleCard
      id="score-inputs"
      title={t("score_inputs")}
      description={t("score_inputs_desc")}
      icon={<ClipboardList className={clsx("w-5 h-5", textSecondary)} />}
      summary={summary}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* policy flags */}
        <div className="flex flex-col gap-3 min-w-0">
          <h3
            className={clsx(
              "font-semibold flex items-center gap-2",
              textPrimary,
            )}
          >
            <ShieldAlert className="w-4 h-4" />
            {t("policy_flags")}
          </h3>
          <p className={clsx("text-xs", textTertiary)}>
            {t("policy_flags_desc")}
          </p>

          {inputs.policyFlags.length === 0 && (
            <p className={clsx("text-sm", textTertiary)}>{t("no_flags")}</p>
          )}
          <ul className="flex flex-col gap-2">
            {[...inputs.policyFlags].reverse().map((flag) => (
              <li
                key={flag._id}
                className={clsx(
                  "rounded-lg border p-3 flex flex-wrap items-start gap-2",
                  borderColor,
                  flag.resolvedAt && "opacity-60",
                )}
              >
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded-md text-xs font-semibold",
                    flag.type === "SUSPENSION"
                      ? isDark
                        ? "bg-red-500/20 text-red-300"
                        : "bg-red-100 text-red-800"
                      : isDark
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-amber-100 text-amber-800",
                  )}
                >
                  {t(`flag_type_${flag.type}`)}
                </span>
                <div className="flex-1 min-w-[10rem]">
                  <div className={clsx("text-sm break-words", textPrimary)}>
                    {flag.reason}
                  </div>
                  <div className={clsx("text-xs", textTertiary)}>
                    {formatDate(flag.createdAt)}
                    {flag.resolvedAt &&
                      ` · ${t("resolved_on", { date: formatDate(flag.resolvedAt) })}`}
                  </div>
                </div>
                {isAdmin && !flag.resolvedAt && (
                  <button
                    type="button"
                    className={button}
                    onClick={async () => {
                      try {
                        await resolveFlag({
                          businessId,
                          flagId: flag._id,
                        }).unwrap();
                        toast.success(t("flag_resolved"));
                      } catch (error) {
                        toast.error(errorText(error, t("save_failed")));
                      }
                    }}
                  >
                    {t("resolve")}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isAdmin && (
            <form
              className="flex flex-col gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (reason.trim().length < 3) {
                  toast.error(t("reason_required"));
                  return;
                }
                try {
                  await addFlag({
                    businessId,
                    type: flagType,
                    reason,
                  }).unwrap();
                  setReason("");
                  toast.success(t("flag_added"));
                } catch (error) {
                  toast.error(errorText(error, t("save_failed")));
                }
              }}
            >
              <div className="flex flex-wrap gap-2">
                <label htmlFor="flag-type" className="sr-only">
                  {t("flag_type")}
                </label>
                <select
                  id="flag-type"
                  value={flagType}
                  onChange={(e) =>
                    setFlagType(e.target.value as IPolicyFlag["type"])
                  }
                  className={fieldInput}
                >
                  <option value="WARNING">{t("flag_type_WARNING")}</option>
                  <option value="SUSPENSION">
                    {t("flag_type_SUSPENSION")}
                  </option>
                </select>
                <label htmlFor="flag-reason" className="sr-only">
                  {t("flag_reason")}
                </label>
                <input
                  id="flag-reason"
                  value={reason}
                  maxLength={500}
                  placeholder={t("flag_reason")}
                  onChange={(e) => setReason(e.target.value)}
                  className={clsx(fieldInput, "flex-1 min-w-[10rem]")}
                />
                <button type="submit" disabled={adding} className={button}>
                  {t("add_flag")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* local sourcing */}
        <form
          className="flex flex-col gap-3 min-w-0"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await saveSourcing({
                businessId,
                localProductsPercent: percent === "" ? null : Number(percent),
                localEmployees: employees === "" ? null : Number(employees),
              }).unwrap();
              toast.success(t("sourcing_saved"));
            } catch (error) {
              toast.error(errorText(error, t("save_failed")));
            }
          }}
        >
          <h3
            className={clsx(
              "font-semibold flex items-center gap-2",
              textPrimary,
            )}
          >
            <BadgeCheck className="w-4 h-4" />
            {t("local_sourcing")}
          </h3>
          <p className={clsx("text-xs", textTertiary)}>
            {t("local_sourcing_desc")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              htmlFor="sourcing-percent"
              className={clsx("flex flex-col gap-1 text-sm", textSecondary)}
            >
              {t("local_products_percent")}
              <input
                id="sourcing-percent"
                type="number"
                min={0}
                max={100}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className={clsx(fieldInput, "tabular-nums")}
              />
            </label>
            <label
              htmlFor="sourcing-employees"
              className={clsx("flex flex-col gap-1 text-sm", textSecondary)}
            >
              {t("local_employees")}
              <input
                id="sourcing-employees"
                type="number"
                min={0}
                step={1}
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className={clsx(fieldInput, "tabular-nums")}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                "px-2 py-0.5 rounded-md text-xs font-medium",
                sourcing?.verifiedAt
                  ? isDark
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-emerald-100 text-emerald-800"
                  : isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600",
              )}
            >
              {sourcing?.verifiedAt
                ? t("verified_on", { date: formatDate(sourcing.verifiedAt) })
                : t("not_verified")}
            </span>
            <button
              type="submit"
              disabled={savingSourcing}
              className={clsx(button, "ms-auto")}
            >
              {t("save")}
            </button>
            {isAdmin && sourcing && (
              <button
                type="button"
                disabled={verifying}
                className={button}
                onClick={async () => {
                  try {
                    await verifySourcing({
                      businessId,
                      verified: !sourcing.verifiedAt,
                    }).unwrap();
                    toast.success(t("sourcing_saved"));
                  } catch (error) {
                    toast.error(errorText(error, t("save_failed")));
                  }
                }}
              >
                {sourcing.verifiedAt ? t("remove_check") : t("mark_checked")}
              </button>
            )}
          </div>
        </form>
      </div>
    </CollapsibleCard>
  );
};

export default ScoreInputsPanel;

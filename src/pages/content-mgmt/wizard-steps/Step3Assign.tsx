import clsx from "clsx";
import { useEffect, useState } from "react";
import {
  Wand2,
  Loader,
  CheckCircle,
  AlertCircle,
  Users,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAssignAllEntitiesMutation } from "@/store/api/contentMutationApi";
import { useGetViewByIdQuery } from "@/store/api/contentQueryApi";

interface Props {
  topics: WizardTopic[];
  externalApiId: string;
  viewId: string;
  onAssignStart: () => void;
  onAssignEnd: () => void;
}

type AssignState = "idle" | "running" | "done" | "error";

export default function Step3Assign({
  topics,
  externalApiId: _externalApiId,
  viewId,
  onAssignStart,
  onAssignEnd,
}: Props) {
  const { isDark } = useThemeClasses();
  const [assignAll] = useAssignAllEntitiesMutation();
  const [assignState, setAssignState] = useState<AssignState>("idle");

  const allCategories = topics.flatMap((t) => t.categories);
  const totalTopics = topics.length;
  const totalCategories = allCategories.length;

  const { data: viewProgress } = useGetViewByIdQuery(
    { viewId },
    {
      skip: !viewId || assignState !== "running",
      pollingInterval: 3000,
    },
  );

  useEffect(() => {
    if (!viewProgress) return;
    const status = (viewProgress as any).assignmentStatus;
    if (status === "done" && assignState === "running") {
      setAssignState("done");
      onAssignEnd();
      toast.success("AI assignment complete — review the results below.");
    } else if (status === "failed" && assignState === "running") {
      setAssignState("error");
      onAssignEnd();
      toast.error(
        "AI assignment failed. You can retry or publish without assignment.",
      );
    }
  }, [(viewProgress as any)?.assignmentStatus]);

  const progressDone: number = (viewProgress as any)?.assignmentDone ?? 0;
  const progressTotal: number =
    (viewProgress as any)?.assignmentTotal ?? totalCategories;
  const progressPercent =
    progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

  const runAssignment = async (reAssignAll: boolean = false) => {
    if (!viewId) {
      toast.error(
        "View is not yet saved — please wait a moment and try again.",
      );
      return;
    }
    setAssignState("running");
    onAssignStart();
    try {
      await assignAll({ viewId, reAssignAll }).unwrap();
    } catch {
      setAssignState("error");
      onAssignEnd();
      toast.error("Failed to start AI assignment.");
    }
  };

  const assignedFromView = (viewProgress as any)?.siteTopics ?? [];
  const totalAssignedFromView = assignedFromView.reduce(
    (sum: number, t: any) =>
      sum +
      (t.siteCategories ?? []).reduce(
        (s: number, c: any) =>
          s + (c.businessIds?.length ?? 0) + (c.productIds?.length ?? 0),
        0,
      ),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div
        className={clsx(
          "rounded-xl p-4 border",
          isDark
            ? "bg-teal-900/20 border-teal-800/40"
            : "bg-teal-50 border-teal-100",
        )}
      >
        <p
          className={clsx(
            "text-sm",
            isDark ? "text-teal-300" : "text-teal-700",
          )}
        >
          AI will go through <strong>every</strong> approved business and
          product and assign them to the most relevant category. This may take a
          moment. You can review and adjust the results before publishing.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Topics", value: totalTopics, color: "teal" },
          { label: "Categories", value: totalCategories, color: "purple" },
          {
            label: "Assigned items",
            value: assignState === "done" ? totalAssignedFromView : 0,
            color: "green",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={clsx(
              "rounded-xl border p-3 text-center",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <p
              className={clsx(
                "text-2xl font-bold",
                color === "teal"
                  ? "text-teal-500"
                  : color === "purple"
                    ? "text-purple-500"
                    : "text-green-500",
              )}
            >
              {value}
            </p>
            <p
              className={clsx(
                "text-xs mt-0.5",
                isDark ? "text-gray-500" : "text-gray-400",
              )}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Assign buttons */}
      {assignState === "idle" && (
        <div className="space-y-2">
          {totalAssignedFromView > 0 ? (
            <>
              <button
                onClick={() => {
                  void runAssignment(false);
                }}
                disabled={totalCategories === 0 || !viewId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
                Continue Assignment
              </button>
              <button
                onClick={() => {
                  void runAssignment(true);
                }}
                disabled={totalCategories === 0 || !viewId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear and reassign all categories"
              >
                <Wand2 className="w-5 h-5" />
                Re-assign All
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                void runAssignment(false);
              }}
              disabled={totalCategories === 0 || !viewId}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-5 h-5" />
              Start AI Assignment
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {assignState === "running" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span
              className={clsx(
                "flex items-center gap-2",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              <Loader className="w-4 h-4 animate-spin text-teal-500" />
              Assigning entities to categories…
            </span>
            <span
              className={clsx(
                "font-medium tabular-nums",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {progressDone} / {progressTotal}
            </span>
          </div>
          <div
            className={clsx(
              "h-2.5 rounded-full overflow-hidden",
              isDark ? "bg-gray-800" : "bg-gray-100",
            )}
          >
            <div
              className="h-full bg-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p
            className={clsx(
              "text-xs text-center",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          >
            {progressTotal - progressDone > 0
              ? `${progressTotal - progressDone} categories remaining…`
              : "Finalising results…"}
          </p>
        </div>
      )}

      {/* Error state */}
      {assignState === "error" && (
        <div
          className={clsx(
            "flex items-center gap-3 p-3 rounded-xl border",
            isDark
              ? "bg-red-900/20 border-red-800/40"
              : "bg-red-50 border-red-100",
          )}
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p
              className={clsx(
                "text-sm font-medium",
                isDark ? "text-red-300" : "text-red-700",
              )}
            >
              Assignment failed
            </p>
            <p
              className={clsx(
                "text-xs",
                isDark ? "text-red-500" : "text-red-600",
              )}
            >
              You can retry or publish without AI assignment and assign manually
              later.
            </p>
          </div>
          <button
            onClick={() => {
              void runAssignment(false);
            }}
            className="text-xs underline text-red-500 hover:text-red-600 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Done state */}
      {assignState === "done" && (
        <div
          className={clsx(
            "flex items-center gap-3 p-3 rounded-xl border",
            isDark
              ? "bg-green-900/20 border-green-800/40"
              : "bg-green-50 border-green-100",
          )}
        >
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <p
              className={clsx(
                "text-sm font-medium",
                isDark ? "text-green-300" : "text-green-700",
              )}
            >
              Assignment complete
            </p>
            <p
              className={clsx(
                "text-xs",
                isDark ? "text-green-500" : "text-green-600",
              )}
            >
              {totalAssignedFromView} items assigned across {totalCategories}{" "}
              categories
            </p>
          </div>
          <button
            onClick={() => {
              void runAssignment(false);
            }}
            className="ms-auto text-xs underline text-green-600 hover:text-green-700 shrink-0"
          >
            Re-run
          </button>
        </div>
      )}

      {/* Per-category summary after done */}
      {assignState === "done" && assignedFromView.length > 0 && (
        <div className="space-y-2">
          <h3
            className={clsx(
              "text-sm font-semibold",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            Results by Category
          </h3>
          {assignedFromView.map((topic: any) => (
            <div key={topic.titleHe || topic.title} className="space-y-1.5">
              <p
                className={clsx(
                  "text-xs font-medium px-1",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              >
                {topic.titleHe || topic.title}
              </p>
              {(topic.siteCategories ?? []).map((cat: any) => {
                const bCount = cat.businessIds?.length ?? 0;
                const pCount = cat.productIds?.length ?? 0;
                const total = bCount + pCount;
                return (
                  <div
                    key={cat.titleHe || cat.title}
                    className={clsx(
                      "flex items-center gap-3 p-2.5 rounded-xl border",
                      isDark
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white",
                    )}
                  >
                    <span
                      className={clsx(
                        "text-sm flex-1 truncate",
                        isDark ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      {cat.titleHe || cat.title || "Untitled"}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      {bCount > 0 && (
                        <span
                          className={clsx(
                            "flex items-center gap-1 text-xs",
                            isDark ? "text-blue-400" : "text-blue-600",
                          )}
                        >
                          <Users className="w-3 h-3" />
                          {bCount}
                        </span>
                      )}
                      {pCount > 0 && (
                        <span
                          className={clsx(
                            "flex items-center gap-1 text-xs",
                            isDark ? "text-purple-400" : "text-purple-600",
                          )}
                        >
                          <Package className="w-3 h-3" />
                          {pCount}
                        </span>
                      )}
                      {total === 0 && (
                        <span
                          className={clsx(
                            "flex items-center gap-1 text-xs",
                            isDark ? "text-gray-600" : "text-gray-400",
                          )}
                        >
                          <AlertCircle className="w-3 h-3" />
                          None
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Skip reminder */}
      {assignState === "idle" && totalCategories > 0 && (
        <p
          className={clsx(
            "text-xs text-center",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        >
          You can skip this step and assign businesses manually after saving.
        </p>
      )}
    </div>
  );
}

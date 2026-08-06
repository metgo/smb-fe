import clsx from "clsx";
import { useState } from "react";
import {
  Building2,
  MapPin,
  BarChart3,
  RefreshCw,
  Download,
} from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetBusinessSummaryQuery,
  useGetPoiSummaryQuery,
} from "@/store/api/analyticsApi";
import { useCommon } from "@/hooks/useCommon";
import DatePicker from "@/components/shared/DatePicker";
import { SkeletonCard } from "./components/SkeletonCard";
import { SkeletonSection } from "./components/SkeletonSection";
import { KeyInsights } from "./components/KeyInsights";
import { DataSection } from "./components/DataSection";
import { CopyableId } from "./components/CopyableId";

/** Local YYYY-MM-DD formatter (no timezone issues) */
const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

interface StatData {
  id?: string;
  name: string;
  total: number;
  prevTotal?: number;
  logo?: string;
  authorities?: Array<{
    id?: string;
    authority: string;
    total: number;
    prevTotal?: number;
    logo?: string;
  }>;
  status?: Array<{ name: string; total: number; prevTotal?: number }>;
}

interface ItemData {
  dmos?: StatData[];
  websites?: StatData[];
  status?: StatData[];
  deleted?: StatData[];
  has_product?: StatData[];
}

interface StatsResponse {
  item: string;
  data: ItemData[];
  insights?: {
    totalChange: number;
    totalChangePercent: number;
    newBusinesses: number;
    statusChanges: any[];
    topGrowthDMO: { name: string; growth: number } | null;
    topGrowthWebsite: { name: string; growth: number } | null;
  };
}

const ITEM_TYPES = [
  { id: "business", label: "Businesses", icon: Building2 },
  { id: "poi", label: "Points of Interest", icon: MapPin },
  // { id: "product", label: "Products", icon: Package },
  // { id: "event", label: "Events", icon: Calendar },
  // { id: "trip", label: "Trips", icon: MapPin },
] as const;

type ItemType = (typeof ITEM_TYPES)[number]["id"];

const StatsSummaryPage = () => {
  const { isDark, textPrimary } = useThemeClasses();

  const [selectedItemType, setSelectedItemType] =
    useState<ItemType>("business");

  const [selectedDate, setSelectedDate] = useState<string>();

  const { data: businessData, isLoading: isBusinessLoading } =
    useGetBusinessSummaryQuery(
      { date: selectedDate },
      { skip: selectedItemType !== "business" },
    );
  const { data: poiData, isLoading: isPoiLoading } = useGetPoiSummaryQuery(
    { date: selectedDate },
    { skip: selectedItemType !== "poi" },
  );

  const data = selectedItemType === "poi" ? poiData : businessData;
  const isLoading =
    selectedItemType === "poi" ? isPoiLoading : isBusinessLoading;

  const { allWebsites, dmosAuthorities } = useCommon();

  // Helper functions to match IDs with names and logos
  const getWebsiteById = (id: string | null): IWebsite | undefined => {
    return allWebsites?.find((w: IWebsite) => w._id === id);
  };

  const getDmoById = (id: string | null): IDmo | undefined => {
    return dmosAuthorities?.find((d) => d._id === id);
  };

  const getAuthorityById = (
    id: string | null,
    dmoId: string | null,
  ): { name: string; logo?: string } | undefined => {
    const dmo = getDmoById(dmoId);
    if (!dmo) return undefined;
    const authority = dmo.authorities?.find((a: any) => a._id === id);
    return authority
      ? { name: authority.name, logo: authority.logoPath }
      : undefined;
  };

  // Transform API data to include names and logos
  const transformStatsData = (
    apiData: IBusinessSummaryStatsRes | IPoiStatsRes | undefined,
  ): StatsResponse | null => {
    if (!apiData?.datas) return null;

    const transformedData: ItemData[] = apiData.datas.data.map(
      (dataItem: any) => ({
        dmos: dataItem.dmos?.map((dmo: IDMOStats) => {
          const dmoInfo = getDmoById(dmo.dmoId);
          return {
            id: dmo.dmoId || undefined,
            name: dmoInfo?.name || dmo.dmoId || "Unassigned",
            total: dmo.total,
            prevTotal: dmo.prevTotal,
            logo: dmoInfo?.logoPath,
            authorities: dmo.authorities?.map((auth: IAuthorityStats) => {
              const authInfo = getAuthorityById(auth.authorityId, dmo.dmoId);
              return {
                id: auth.authorityId || undefined,
                authority: authInfo?.name || auth.authorityName,
                total: auth.total,
                prevTotal: auth.prevTotal,
                logo: authInfo?.logo,
              };
            }),
          };
        }),
        websites: dataItem.websites?.map((website: IWebsiteStats) => {
          const websiteInfo = getWebsiteById(website.websiteId);
          return {
            id: website.websiteId || undefined,
            name: websiteInfo?.name || website.websiteId || "Unassigned",
            total: website.total,
            prevTotal: website.prevTotal,
            logo: websiteInfo?.logo,
            status: website.status,
          };
        }),
        status: dataItem.status,
        deleted: dataItem.deleted,
        has_product: dataItem.has_product,
      }),
    );

    return {
      item: apiData.datas.item,
      data: transformedData,
      insights: apiData.datas.insights,
    };
  };

  const statsData = transformStatsData(data);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (statusName: string) => {
    const styles: Record<string, string> = {
      APPROVED: isDark
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: isDark
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-red-50 text-red-700 border-red-200",
      PENDING: isDark
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-amber-50 text-amber-700 border-amber-200",
      DRAFT: isDark
        ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
        : "bg-gray-100 text-gray-700 border-gray-200",
      ARCHIVED: isDark
        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
        : "bg-purple-50 text-purple-700 border-purple-200",
      CLOSED: isDark
        ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
        : "bg-orange-50 text-orange-700 border-orange-200",
    };
    return (
      styles[statusName] ||
      (isDark
        ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
        : "bg-gray-100 text-gray-700 border-gray-200")
    );
  };

  const calculateTotal = (data?: StatData[]) => {
    if (!data) return 0;
    return data.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateGrandTotal = () => {
    if (!statsData?.data) return 0;
    return statsData.data.reduce((sum, section) => {
      return (
        sum + calculateTotal(section.dmos) + calculateTotal(section.websites)
      );
    }, 0);
  };

  const grandTotal = calculateGrandTotal();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Stats Summary
          </h1>
          <p
            className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Track daily counts, distributions, and actionable insights for all
            system items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={isLoading}
            className={`p-2.5 rounded-xl border transition-all ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isDark
                ? "bg-teal-600 border-teal-500 text-white hover:bg-teal-700"
                : "bg-teal-600 border-teal-600 text-white hover:bg-teal-700 shadow-sm"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`p-5 rounded-2xl border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="">
          {/* Date Picker */}
          <div className="flex items-center justify-between">
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Select Date
              </label>
              <div className="flex items-center gap-3">
                <div className="w-45">
                  <DatePicker
                    value={selectedDate ? selectedDate : ""}
                    onChange={(date) =>
                      setSelectedDate(date || formatLocalDate(new Date()))
                    }
                    disableFuture
                  />
                </div>

                <button
                  onClick={() => setSelectedDate(formatLocalDate(new Date()))}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Today
                </button>
              </div>
            </div>
            <h1 className={clsx(textPrimary, "text-3xl capitalize font-bold")}>
              {data?.datas?.item}
            </h1>
          </div>

          {/* Item Type Selector */}
          <div className="mt-4">
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Item Type
            </label>
            <div className="flex flex-wrap gap-2">
              {ITEM_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = selectedItemType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedItemType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      isActive
                        ? isDark
                          ? "bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/20"
                          : "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-200"
                        : isDark
                          ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                    />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} isDark={isDark} />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <SkeletonSection key={i} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Stats Content */}
      {!isLoading && statsData && (
        <>
          {/* Key Insights Panel */}
          <KeyInsights
            selectedItemType={selectedItemType}
            grandTotal={grandTotal}
            insights={statsData?.insights}
          />

          {/* Detailed Data Sections */}
          <div className="space-y-4">
            {statsData.data.map((section: ItemData, sectionIndex: number) => (
              <div key={sectionIndex}>
                {section.dmos && (
                  <DataSection
                    title="DMOs"
                    data={section.dmos}
                    sectionId={`dmos-${sectionIndex}`}
                    isExpanded={expandedSections.has(`dmos-${sectionIndex}`)}
                    isDark={isDark}
                    total={calculateTotal(section.dmos)}
                    icon={Building2}
                    onToggle={toggleSection}
                    renderSubItems={(item: StatData) => (
                      <div className="space-y-2">
                        {item.authorities?.map((auth, authIndex) => (
                          <div
                            key={authIndex}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg border ${
                              isDark
                                ? "bg-gray-800/50 border-gray-700"
                                : "bg-white border-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {auth.logo ? (
                                <img
                                  src={auth.logo}
                                  alt={auth.authority}
                                  className="w-4 h-4 rounded object-fit"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Building2
                                  className={`w-3.5 h-3.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                />
                              )}
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                                >
                                  {auth.authority === "null"
                                    ? "Unassigned"
                                    : auth.authority}
                                </span>
                                {auth.id && <CopyableId id={auth.id} />}
                              </div>
                            </div>
                            <span
                              className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                            >
                              {auth.total.toLocaleString()}
                              {auth.prevTotal != null &&
                                auth.prevTotal !== auth.total && (
                                  <span
                                    className={`ml-1.5 text-xs font-medium ${
                                      auth.total > auth.prevTotal
                                        ? isDark
                                          ? "text-emerald-400"
                                          : "text-emerald-600"
                                        : isDark
                                          ? "text-red-400"
                                          : "text-red-600"
                                    }`}
                                  >
                                    ({auth.total > auth.prevTotal ? "↑" : "↓"}{" "}
                                    {auth.prevTotal.toLocaleString()})
                                  </span>
                                )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                )}
                {section.websites && (
                  <DataSection
                    title="Websites"
                    data={section.websites}
                    sectionId={`websites-${sectionIndex}`}
                    isExpanded={expandedSections.has(
                      `websites-${sectionIndex}`,
                    )}
                    isDark={isDark}
                    total={calculateTotal(section.websites)}
                    icon={MapPin}
                    onToggle={toggleSection}
                    renderSubItems={(item: StatData) => (
                      <div className="space-y-2">
                        {item.status?.map((status, statusIndex) => (
                          <div
                            key={statusIndex}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg border ${
                              isDark
                                ? "bg-gray-800/50 border-gray-700"
                                : "bg-white border-gray-100"
                            }`}
                          >
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(status.name)}`}
                            >
                              {status.name}
                            </span>
                            <span
                              className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                            >
                              {status.total.toLocaleString()}
                              {status.prevTotal != null &&
                                status.prevTotal !== status.total && (
                                  <span
                                    className={`ml-1.5 text-xs font-medium ${
                                      status.total > status.prevTotal
                                        ? isDark
                                          ? "text-emerald-400"
                                          : "text-emerald-600"
                                        : isDark
                                          ? "text-red-400"
                                          : "text-red-600"
                                    }`}
                                  >
                                    (
                                    {status.total > status.prevTotal
                                      ? "↑"
                                      : "↓"}{" "}
                                    {status.prevTotal.toLocaleString()})
                                  </span>
                                )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                )}
                {section.status && (
                  <DataSection
                    title="Overall Status"
                    data={section.status}
                    sectionId={`status-${sectionIndex}`}
                    isExpanded={expandedSections.has(`status-${sectionIndex}`)}
                    isDark={isDark}
                    total={calculateTotal(section.status)}
                    icon={BarChart3}
                    onToggle={toggleSection}
                    renderSubItems={(item: StatData) => (
                      <div>
                        <div
                          className={`flex items-center justify-between py-2 px-3 rounded-lg border ${
                            isDark
                              ? "bg-gray-800/50 border-gray-700"
                              : "bg-white border-gray-100"
                          }`}
                        >
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(item.name)}`}
                          >
                            {item.name}
                          </span>
                          <span
                            className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                          >
                            {item.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                )}
                {section.deleted && (
                  <DataSection
                    title="Deleted"
                    data={section.deleted}
                    sectionId={`deleted-${sectionIndex}`}
                    isExpanded={expandedSections.has(`deleted-${sectionIndex}`)}
                    isDark={isDark}
                    total={calculateTotal(section.deleted)}
                    icon={BarChart3}
                    onToggle={toggleSection}
                  />
                )}
                {section.has_product && (
                  <DataSection
                    title="Has Product"
                    data={section.has_product}
                    sectionId={`has_product-${sectionIndex}`}
                    isExpanded={expandedSections.has(
                      `has_product-${sectionIndex}`,
                    )}
                    isDark={isDark}
                    total={calculateTotal(section.has_product)}
                    icon={BarChart3}
                    onToggle={toggleSection}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsSummaryPage;

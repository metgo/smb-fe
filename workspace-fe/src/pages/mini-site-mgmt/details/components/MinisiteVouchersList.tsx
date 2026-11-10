import { Mail, Phone, Clock, ShoppingCart, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, useCallback } from "react";

import { ReordableDataTable } from "@/components/shared";
import ActionIconButtons from "@/components/btns/ActionIconButtons";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  isExpired,
  isExpiringSoon,
} from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllVouchersQuery } from "@/store/api/voucherQueryApi";
import { useUserRoles } from "@/hooks/useUserRoles";
import TooltipWrapper from "@/components/wrapper/TooltipWrapper";
import MinisiteVoucherOrderList from "./MinisiteVoucherOrderList";

const LIMIT = 20;

interface MinisiteVouchersListProps {
  miniSiteId: string | undefined;
}

const MinisiteVouchersList = ({ miniSiteId }: MinisiteVouchersListProps) => {
  const { t } = useTranslation("vouchers");
  const { isDark } = useThemeClasses();
  const { isSuperadmin } = useUserRoles();
  const [ordersVoucher, setOrdersVoucher] = useState<IVoucherItem | null>(null);
  const [isOrdersPanelVisible, setIsOrdersPanelVisible] = useState(false);

  useEffect(() => {
    if (!ordersVoucher) return;
    const frame = requestAnimationFrame(() => setIsOrdersPanelVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [ordersVoucher]);

  const closeOrdersPanel = () => {
    setIsOrdersPanelVisible(false);
    setTimeout(() => setOrdersVoucher(null), 300);
  };

  const columns = useMemo(
    () => [
      ...(isSuperadmin
        ? [
            {
              key: "code",
              label: t("code"),
              sortable: true,
              render: (voucher: IVoucherItem) => (
                <span
                  className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {voucher.code}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "assignee",
        label: t("assignee"),
        sortable: true,
        render: (voucher: IVoucherItem) => (
          <span
            className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            {voucher?.assigneeInfo?.name || "-"}
          </span>
        ),
      },
      {
        key: "contact",
        label: t("contact"),
        sortable: false,
        render: (voucher: IVoucherItem) => (
          <div className="flex items-center gap-2">
            {voucher?.assigneeInfo?.email ? (
              <TooltipWrapper
                infoText={voucher?.assigneeInfo?.email}
                side="top"
              >
                <a
                  href={`mailto:${voucher?.assigneeInfo?.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1 transition-colors ${isDark ? "text-gray-400 hover:text-teal-400" : "text-gray-600 hover:text-teal-600"}`}
                >
                  <Mail className="w-4 h-4" />
                </a>
              </TooltipWrapper>
            ) : (
              <span>-</span>
            )}
            {voucher?.assigneeInfo?.phone ? (
              <TooltipWrapper
                infoText={voucher?.assigneeInfo?.phone}
                side="top"
              >
                <a
                  href={`tel:${voucher?.assigneeInfo?.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1 transition-colors ${isDark ? "text-gray-400 hover:text-teal-400" : "text-gray-600 hover:text-teal-600"}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </TooltipWrapper>
            ) : (
              <span>-</span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        label: t("status"),
        sortable: true,
        render: (voucher: any) => (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
              voucher.status,
              isDark,
            )}`}
          >
            {getStatusLabel(voucher.status)}
          </span>
        ),
      },
      {
        key: "amount",
        label: t("amount"),
        sortable: true,
        render: (voucher: IVoucherItem) => (
          <span
            className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            ₪{voucher.amount}
          </span>
        ),
      },
      {
        key: "remainingAmount",
        label: t("remaining"),
        sortable: true,
        render: (voucher: any) => (
          <span
            className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            ₪{voucher.remainingAmount}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: t("created_at"),
        sortable: true,
        render: (voucher: any) => (
          <span
            className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            {formatDate(voucher?.creatorInfo?.createdAt)}
          </span>
        ),
      },
      {
        key: "expireDate",
        label: t("expiry"),
        sortable: true,
        render: (voucher: IVoucherItem) => {
          const expired = isExpired(voucher.expireDate);
          const expiringSoon = isExpiringSoon(voucher.expireDate);
          const textColor = expired
            ? isDark
              ? "text-red-400"
              : "text-red-600"
            : expiringSoon
              ? isDark
                ? "text-orange-400"
                : "text-orange-400"
              : isDark
                ? "text-gray-100"
                : "text-gray-900";

          return (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${textColor}`}>
                {formatDate(voucher.expireDate)}
              </span>
              {expiringSoon && !expired && (
                <span title={t("expiring_soon")}>
                  <Clock
                    className={`w-4 h-4 ${isDark ? "text-orange-400" : "text-orange-500"}`}
                  />
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "campaign",
        label: t("campaign"),
        sortable: true,
        render: (voucher: any) => (
          <span
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {voucher.campId || "-"}
          </span>
        ),
      },
      {
        key: "actions",
        label: t("actions"),
        sortable: false,
        render: (voucher: IVoucherItem) => {
          const actions: IActionIconButton[] = [
            {
              title: t("view_orders") || "View orders",
              icon: ShoppingCart,
              color: "blue",
              onClick: () => setOrdersVoucher(voucher),
            },
          ];
          return <ActionIconButtons isDark={isDark} actions={actions} />;
        },
      },
    ],
    [isSuperadmin, isDark, t],
  );
  const [page, setPage] = useState(1);

  const voucherQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
      miniSiteId,
      purpose: "minisite",
    };
    return params;
  }, [page, miniSiteId]);

  const {
    data: voucherData,
    isLoading,
    isFetching,
  } = useGetAllVouchersQuery(voucherQueryParams);

  const allVouchers = voucherData?.data;
  const [combinedVouchers, setCombinedVouchers] = useState<IVoucherItem[]>([]);
  const hasMore = voucherData?.meta?.hasNextPage;

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  useEffect(() => {
    if (!allVouchers?.length) {
      setCombinedVouchers([]);
      return;
    }
    setCombinedVouchers((prev) => {
      if (page === 1) return allVouchers;
      const existingIds = new Set(prev.map((p) => p._id));
      const newItems = allVouchers?.filter((p: any) => !existingIds.has(p._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [allVouchers, page]);

  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(
    new Set(),
  );

  return (
    <div className="flex-1 overflow-y-auto min-h-0 relative">
      <ReordableDataTable
        rowKey="_id"
        columns={columns}
        next={fetchNextPage}
        hasMore={hasMore}
        data={combinedVouchers}
        isDataLoading={isLoading || isFetching}
        selectedItems={selectedVouchers}
        onSelectionChange={setSelectedVouchers}
        storageKey="vouchersTableColumnOrder"
      />

      {ordersVoucher && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isOrdersPanelVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeOrdersPanel}
          />
          <div
            className={`relative h-full w-full max-w-3xl shadow-xl flex flex-col transform transition-transform duration-300 ease-out ${
              isOrdersPanelVisible ? "translate-x-0" : "translate-x-full"
            } ${isDark ? "bg-gray-900" : "bg-white"}`}
          >
            <button
              onClick={closeOrdersPanel}
              className={`p-1.5 rounded-md transition-colors cursor-pointer bg-red-800 hover:bg-red-500 text-white  w-max m-2 `}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-y-auto min-h-0 p-3">
              <MinisiteVoucherOrderList voucher={ordersVoucher} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinisiteVouchersList;

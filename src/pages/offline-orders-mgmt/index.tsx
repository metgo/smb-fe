import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, useCallback } from "react";
import { DollarSign, PenBox, Trash2, CreditCard, Landmark } from "lucide-react";

import { ActionIconButtons } from "@/components/btns";
import { ReordableDataTable, ConfirmDialog } from "@/components/shared";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatDate } from "@/helpers";
import {
  useGetOfflineOrdersQuery,
  useDeleteOfflineOrderMutation,
} from "@/store/api/orderQueryApi";
import { useGetOfflineOrderStatsQuery } from "@/store/api/itemStatsApi";
import CreateOfflineOrderWizard from "./components/CreateOfflineOrderWizard";
import { formatILS } from "@/helpers/formatter";

const LIMIT = 20;

export default function OfflineOrdersMgmtPage() {
  const { t } = useTranslation("orders");
  const { t: tc } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [combinedOfflineOrders, setCombinedOfflineOrders] = useState<
    IOfflineOrder[]
  >([]);
  const [selectedOfflineOrders, setSelectedOfflineOrders] = useState<
    Set<string>
  >(new Set());

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
    }),
    [page],
  );

  const statsParams = useMemo(
    () => ({
      startDate: "2000-01-01",
      endDate: new Date().toISOString(),
    }),
    [],
  );

  const {
    data: offlineOrderStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetOfflineOrderStatsQuery(statsParams);

  const [wizardOrder, setWizardOrder] = useState<
    IOfflineOrder | null | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<IOfflineOrder | null>(null);

  const {
    data: offlineOrdersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOfflineOrdersQuery(queryParams);

  const [deleteOfflineOrder, { isLoading: isDeleting }] =
    useDeleteOfflineOrderMutation();

  const hasMore = !!offlineOrdersData?.meta?.hasNextPage;

  const refetchAll = useCallback(() => {
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  useEffect(() => {
    const items = offlineOrdersData?.data;
    if (!items?.length) {
      setCombinedOfflineOrders([]);
      return;
    }
    setCombinedOfflineOrders((prev) => {
      if (page === 1) return items;
      const existingIds = new Set(prev.map((item) => item._id));
      const newItems = items.filter((item) => !existingIds.has(item._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [offlineOrdersData, page]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteOfflineOrder(deleteTarget._id).unwrap();
      toast.success(t("offline_order_deleted"));
      setDeleteTarget(null);
      refetchAll();
    } catch (error: any) {
      toast.error(error?.data?.message || t("offline_order_delete_failed"));
    }
  };

  const offlineOrderStatsItems = useMemo(
    () => [
      {
        id: 1,
        title: t("total_amount"),
        value: formatILS(offlineOrderStats?.totalAmount),
        icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("bank_transfer"),
        value: formatILS(offlineOrderStats?.bankTransfer),
        icon: <Landmark className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("credit_card"),
        value: formatILS(offlineOrderStats?.creditCard),
        icon: <CreditCard className="w-5 h-5 text-teal-600" />,
      },
    ],
    [offlineOrderStats, t],
  );

  const columns = useMemo(
    () => [
      {
        key: "companyName",
        label: t("business_name"),
        sortable: true,
      },
      {
        key: "name",
        label: t("customer_name"),
        sortable: true,
      },
      {
        key: "phone",
        label: t("phone"),
        sortable: false,
      },
      {
        key: "product",
        label: t("product_name"),
        sortable: true,
      },
      {
        key: "vendor",
        label: t("vendor"),
        sortable: true,
      },
      {
        key: "desiredQuantity",
        label: t("quantity"),
        sortable: true,
      },
      {
        key: "productPrice",
        label: t("product_price"),
        sortable: true,
        render: (order: IOfflineOrder) =>
          order.productPrice ? `₪${order.productPrice}` : "-",
      },
      {
        key: "initilaRequest",
        label: t("initial_request"),
        sortable: true,
        render: (order: IOfflineOrder) =>
          order.initialRequest ? `₪${order.initialRequest}` : "-",
      },
      {
        key: "closedDealValue",
        label: t("closed_deal_value"),
        sortable: true,
        render: (order: IOfflineOrder) =>
          order.closedDealValue ? `₪${order.closedDealValue}` : "-",
      },
      {
        key: "paymentMethod",
        label: t("payment_method"),
        sortable: true,
      },
      {
        key: "dealClosureDate",
        label: t("created_date"),
        sortable: true,
        render: (order: IOfflineOrder) => formatDate(order.dealClosureDate),
      },
      {
        key: "actions",
        label: tc("actions"),
        sortable: false,
        render: (order: IOfflineOrder) => {
          const actions: IActionIconButton[] = [
            {
              title: tc("edit"),
              icon: PenBox,
              color: "gray",
              onClick: () => setWizardOrder(order),
            },
            {
              title: tc("delete"),
              icon: Trash2,
              color: "red",
              onClick: () => setDeleteTarget(order),
            },
          ];
          return <ActionIconButtons isDark={isDark} actions={actions} />;
        },
      },
    ],
    [t, tc, isDark],
  );

  return (
    <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
      <div
        className={clsx(
          "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
        )}
      >
        <ListHeaderBar
          title={t("offline_orders_management")}
          titleGradient="from-blue-500 via-indigo-600 to-purple-600"
          count={offlineOrdersData?.totalData}
          addLabel={t("add_offline_order")}
          onAdd={() => setWizardOrder(null)}
          stats={offlineOrderStatsItems}
          isStatsLoading={isStatsLoading}
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <ReordableDataTable
          rowKey="_id"
          columns={columns}
          data={combinedOfflineOrders}
          isDataLoading={isLoading || isFetching}
          selectedItems={selectedOfflineOrders}
          onSelectionChange={setSelectedOfflineOrders}
          storageKey="offlineOrdersTableColumnOrder"
          hasMore={hasMore}
          next={fetchNextPage}
        />
      </div>

      {wizardOrder !== undefined && (
        <CreateOfflineOrderWizard
          order={wizardOrder}
          onClose={() => setWizardOrder(undefined)}
          refetch={refetchAll}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title={t("delete_offline_order")}
        message={t("delete_offline_order_confirm", {
          name: deleteTarget?.companyName,
        })}
        confirmText={tc("delete")}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import { Mail, Phone, X, XCircle } from "lucide-react";

import InfoRow from "./sub-components/InfoRow";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ProductDetailsModal from "./sub-components/ProductDetailsModal";
import CancellationDialog from "./sub-components/CancellationDialog";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void
}

const USER_ROLE = "authority"


export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const { t } = useTranslation('orders');
  const { isRTL, theme } = useAppSelector((state) => state.settings)
  const {textPrimary, textTertiary}=useThemeClasses()

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderProduct | null>(null);
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>(order?.products);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelType, setCancelType] = useState<'order' | 'item'>('order');
  const [itemToCancel, setItemToCancel] = useState<OrderProduct | null>(null);


  function getOrderStatusBadge(status: Order['orderStatus']) {
    const badges = {
      draft: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-300',
        label: t('draft')
      },
      processing: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-400',
        label: t('processing')
      },
      paid: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        label: t('paid')
      },
      confirmed: {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-800 dark:text-teal-400',
        label: t('confirmed')
      },
      delivered: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-400',
        label: t('delivered')
      },
      completed: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-400',
        label: t('completed')
      },
      cancelled: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        label: t('cancelled')
      },
      partially_cancelled: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-400',
        label: t('partiallyCancelled')
      },
      failed: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        label: t('failed')
      },
    };

    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  }

  function getPaymentStatusBadge(status: Order['paymentStatus']) {
    const badges = {
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        label: t('pending')
      },
      success: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        label: t('success')
      },
      failed: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        label: t('failed')
      },
      refunded: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-400',
        label: t('refunded')
      },
      partially_refunded: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-400',
        label: t('partiallyRefunded')
      },
    };

    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
          }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h2 className={`text-2xl ${textPrimary}`}>{order?.id}</h2>
              <div className="flex gap-2 mt-2">
                {getOrderStatusBadge(order?.orderStatus)}
                {getPaymentStatusBadge(order?.paymentStatus)}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Purchaser Information */}
          <div>
            <h3 className={`text-lg mb-3 ${textPrimary}`}>{t('purchaserInformation')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label={t('name')} value={order?.purchaserName} theme={theme} />
              {/* Email - Clickable */}
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('email')}</p>
                <a
                  href={`mailto:${order?.email}`}
                  className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
                >
                  <Mail className="w-3 h-3" />
                  {order?.email}
                </a>
              </div>
              {/* Phone - Clickable */}
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('phone')}</p>
                <a
                  href={`tel:${order?.phone}`}
                  className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
                >
                  <Phone className="w-3 h-3" />
                  {order?.phone}
                </a>
              </div>
              <InfoRow label={t('campaign')} value={`${order?.campaign} (${order?.campaignCode})`} theme={theme} />
              {order?.address && <InfoRow label={t('address')} value={order?.address} theme={theme} />}
            </div>
          </div>
          {/* Products Section */}
          <div>
            <h3 className={`text-lg mb-3 ${textPrimary}`}>{t('products')}</h3>
            <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              {orderProducts?.map((product, idx) => (
                <div
                  key={product?.id}
                  className={`p-4 ${idx > 0 ? `border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}` : ''} ${product?.cancelled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductModal(true);
                      }}
                      className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={product?.imageUrl}
                        alt={product?.name}
                        className={`w-20 h-20 object-cover rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
                      />
                    </div>
                    {/* Product Info */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductModal(true);
                      }}
                    >
                      <p className={`${textPrimary} ${product?.cancelled ? 'line-through' : ''}`}>{product?.name}</p>
                      <p className={`text-sm ${textTertiary}`}>{product?.vendor}</p>
                      <p className={`text-xs ${textTertiary} mt-1`}>{product?.category}</p>
                    </div>
                    {/* Price & Actions */}
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                        <p className={`${textPrimary} ${product?.cancelled ? 'line-through' : ''}`}>₪{(product?.quantity * product?.unitPrice).toLocaleString()}</p>
                        <p className={`text-sm ${textTertiary}`}>{product?.quantity} x ₪{product?.unitPrice}</p>
                      </div>
                      {/* Cancel Button */}
                      {!product?.cancelled && USER_ROLE !== 'authority' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelType('item');
                            setItemToCancel(product);
                            setShowCancelDialog(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                            ? 'hover:bg-red-900/30 text-red-400'
                            : 'hover:bg-red-50 text-red-500'
                            }`}
                          title={t('cancelProduct')}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      {product?.cancelled && (
                        <span className={`text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`}>
                          {t('cancelled')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Payment Breakdown */}
          <div>
            <h3 className={`text-lg mb-3 ${textPrimary}`}>{t('paymentBreakdown')}</h3>
            <div className={`border rounded-lg p-4 space-y-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className={textTertiary}>{t('voucherAmount')}</span>
                <span className={textPrimary}>₪{order?.voucherAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>{t('creditCardAmount')}</span>
                <span className={textPrimary}>₪{order?.creditCardAmount.toLocaleString()}</span>
              </div>
              {order?.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className={textTertiary}>{t('deliveryFee')}</span>
                  <span className={textPrimary}>₪{order?.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className={`flex justify-between pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <span className={`${textPrimary}`}>{t('total')}</span>
                <span className={`${textPrimary}`}>₪{order?.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* Actions */}
          {USER_ROLE !== 'authority' && (
            <div className={`flex gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => {
                  setCancelType('order');
                  setItemToCancel(null);
                  setShowCancelDialog(true);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                {t('cancelOrder')}
              </button>
              <button className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}>
                {t('resendNotification')}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Cancellation Dialog */}
      {showCancelDialog && (
        <CancellationDialog
          type={cancelType}
          itemName={itemToCancel?.name}
          onCancel={() => {
            setShowCancelDialog(false);
            setItemToCancel(null);
          }}
          onConfirm={(reason, notes) => {
            if (cancelType === 'item' && itemToCancel) {
              setOrderProducts(prev =>
                prev.map(p => p.id === itemToCancel.id ? { ...p, cancelled: true } : p)
              );
            } else {
              // Handle order cancellation
              console.log('Order cancelled:', { reason, notes });
            }
            setShowCancelDialog(false);
            setItemToCancel(null);
          }}
        />
      )}
      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
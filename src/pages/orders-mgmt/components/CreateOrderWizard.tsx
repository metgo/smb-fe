import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/hooks/hooks";
import { availableProducts } from "@/constants/data";
import {
  Box,
  CheckCircle,
  CreditCard,
  Search,
  ShoppingCart,
  User,
  X,
  XCircle,
} from "lucide-react";
import { PublishButton } from "@/components/btns";
import { toast } from "sonner";
import {
  useInitOrderCreateMutation,
  useUpdateOrderMutation,
} from "@/store/api/orderMutationApi";
import { ModalWrapper } from "@/components/wrapper";
import { WizardFooter } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface CreateOrderWizard {
  onClose: () => void;
  onOpen: () => void;

  onAddOrder?: (order: Partial<IOrder>) => void;
}

export default function CreateOrderWizard({
  onClose,
  onOpen,
  onAddOrder,
}: CreateOrderWizard) {
  const { t } = useTranslation("orders");
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const { isDark } = useThemeClasses();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    purchaserName: "",
    email: "",
    phone: "",
    products: [] as Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      vendor: string;
      category: string;
    }>,
    voucherAmount: 0,
    creditCardAmount: 0,
    deliveryMethod: "pickup" as "pickup" | "delivery" | "digital",
    deliveryAddress: "",
    deliveryInstructions: "",
    deliveryFee: 0,
  });

  const [productSearch, setProductSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  //create and update orders
  const [updateOrder, { isLoading: isSaving }] = useUpdateOrderMutation();
  const [initOrderCreate, { isLoading: isCreating }] =
    useInitOrderCreateMutation();

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.vendor.toLowerCase().includes(productSearch.toLowerCase()),
  );
  const totalSteps = 4;

  const stepPayloadMap = {
    // Step 1: Basic purchaser info
    purchaserName: formData.purchaserName,
    email: formData.email,
    phone: formData.phone,

    // Step 2: Products
    products: formData.products.map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      vendor: product.vendor,
      category: product.category,
    })),

    // Step 3: Payment and delivery details
    voucherAmount: formData.voucherAmount,
    creditCardAmount: formData.creditCardAmount,
    deliveryMethod: formData.deliveryMethod,
    deliveryAddress: formData.deliveryAddress,
    deliveryInstructions: formData.deliveryInstructions,
    deliveryFee: formData.deliveryFee,
  };
  console.log("🚀 ~ CreateOrderWizard ~ stepPayloadMap:", stepPayloadMap);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.purchaserName.trim())
        newErrors.purchaserName =
          t("field_required") || "This field is required";
      if (!formData.email.trim())
        newErrors.email = t("field_required") || "This field is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = t("invalid_email") || "Invalid email";
      if (!formData.phone.trim())
        newErrors.phone = t("field_required") || "This field is required";
    } else if (step === 2) {
      if (formData.products.length === 0)
        newErrors.products =
          t("field_required") || "At least one product is required";
    } else if (step === 3) {
      const total =
        formData.products.reduce(
          (sum, p) => sum + p.quantity * p.unitPrice,
          0,
        ) + formData.deliveryFee;
      if (formData.voucherAmount + formData.creditCardAmount !== total) {
        newErrors.payment = "Payment amounts must equal total";
      }
      if (
        formData.deliveryMethod === "delivery" &&
        !formData.deliveryAddress.trim()
      ) {
        newErrors.deliveryAddress =
          t("field_required") || "This field is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    await saveDraft(false);
  };
  const handleNext = async () => {
    if (!validateStep(currentStep) && isPublishBtnClicked) return;
    // await saveDraft(false);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleAddProduct = (product: (typeof availableProducts)[0]) => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price,
          vendor: product.vendor,
          category: product.category,
        },
      ],
    }));
    setProductSearch("");
  };

  const handleRemoveProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity > 0) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.map((p, i) =>
          i === index ? { ...p, quantity } : p,
        ),
      }));
    }
  };
  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        let internalorderId;

        // 1️⃣ Initialize event if not created yet
        if (!orderId) {
          const res = await initOrderCreate().unwrap();
          internalorderId = res?.id;
          setOrderId(res?.id);
        }

        // 2️⃣ Build base payload
        let payload = stepPayloadMap;

        // 3️⃣ If publishing, override status
        if (isPublish) {
          payload = {
            ...payload,
          };
        }

        if (!Object.keys(payload).length) return;

        // 4️⃣ Update event
        const res = await updateOrder({
          orderId: internalorderId || orderId!,
          body: payload,
        }).unwrap();

        // // 5️⃣ Clear dirty steps up to current step
        // setDirtySteps((prev) => {
        //   const next = new Set(prev);
        //   [...next].forEach((s) => s <= currentStep && next.delete(s));
        //   return next;
        // });

        toast.success(
          res?.message ?? (isPublish ? "Order published" : "Draft saved"),
        );
      } catch (err: any) {
        toast.error(err?.message || "Failed to save draft");
      }
    },
    [currentStep, initOrderCreate, orderId, stepPayloadMap, updateOrder],
  );

  const handlePublish = async () => {
    setIsPublishBtnClicked(true);
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (!allValid) {
      toast.error(t("fill_all_fields"));
      return;
    }

    setIsPublishing(true);
    await saveDraft(true);

    setIsPublishing(false);
    toast.success(t("order created succesfully"));
    onClose();
  };
  const totalAmount =
    formData.products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) +
    formData.deliveryFee;

  const steps = [
    {
      number: 1,
      label: t("wizard_step_customer") || "Customer Info",
      icon: <User size={20} />,
    },
    {
      number: 2,
      label: t("wizard_step_products") || "Products",
      icon: <Box size={20} />,
    },
    {
      number: 3,
      label: t("wizard_step_payment_delivery") || "Payment & Delivery",
      icon: <CreditCard size={20} />,
    },
    {
      number: 4,
      label: t("wizard_step_review") || "Review",
      icon: <CheckCircle size={20} />,
    },
  ];

  return (
    <ModalWrapper
      height="20vh"
      onClose={onClose}
      showSpinner={isCreating || isSaving}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl">{t("add_order")}</h2>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("step")} {currentStep} {t("of")} {totalSteps}:{" "}
              {steps[currentStep - 1].label}
            </p>
          </div>
          <PublishButton onClick={handlePublish} isLoading={isPublishing} />
        </div>
        {/* Step Indicator */}
        <div
          className={`flex items-center justify-between mt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="flex items-center flex-1 cursor-pointer"
              onClick={() => setCurrentStep(step.number)}
            >
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.number
                      ? "bg-teal-500 text-white"
                      : isDark
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs mt-2 ${currentStep >= step.number ? "text-teal-500" : theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.number
                      ? "bg-teal-500"
                      : isDark
                        ? "bg-gray-800"
                        : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1">
        {/* Step 1: Customer Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg mb-4">
              {t("customer_information") || "Customer Information"}
            </h3>

            <div>
              <label
                className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
              >
                {t("purchaser_name") || "Purchaser Name"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.purchaserName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    purchaserName: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.purchaserName ? "border-red-500" : ""}`}
              />
              {errors.purchaserName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.purchaserName}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
              >
                {t("purchaser_email") || "Email"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
              >
                {t("purchaser_phone") || "Phone"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Product Selection */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg mb-4">
              {t("product_selection") || "Product Selection"}
            </h3>

            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
              />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={
                  t("search_products_to_add") || "Search products..."
                }
                className={`w-full py-2 rounded-lg border transition-colors ${isRTL ? "pr-10 pl-3 text-right" : "pl-10 pr-3"} ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Available Products */}
            {productSearch && (
              <div
                className={`border rounded-lg max-h-48 overflow-y-auto ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
              >
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className={`w-full p-3 text-left transition-colors ${isRTL ? "text-right" : ""} ${
                      theme === "dark"
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-50"
                    } ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b last:border-b-0`}
                  >
                    <div
                      className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p
                          className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {product.vendor}
                        </p>
                      </div>
                      <p className="text-teal-500">₪{product.price}</p>
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p
                    className={`p-3 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    No products found
                  </p>
                )}
              </div>
            )}

            {/* Selected Products */}
            <div>
              <h4
                className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
              >
                {t("products_ordered") || "Products Ordered"} (
                {formData.products.length})
              </h4>
              {formData.products.length === 0 ? (
                <div
                  className={`p-8 text-center border-2 border-dashed rounded-lg ${
                    theme === "dark"
                      ? "border-gray-700 text-gray-400"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No products added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.products.map((product, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div
                        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p
                            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {product.vendor}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                idx,
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className={`w-16 px-2 py-1 text-center rounded border ${
                              theme === "dark"
                                ? "bg-gray-900 border-gray-600"
                                : "bg-white border-gray-300"
                            }`}
                          />
                          <span>×</span>
                          <span className="w-20">₪{product.unitPrice}</span>
                          <span className="w-24 text-right">
                            ₪
                            {(
                              product.quantity * product.unitPrice
                            ).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleRemoveProduct(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.products && (
                <p className="text-red-500 text-xs mt-1">{errors.products}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Payment & Delivery */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg mb-4">
              {t("payment_delivery_info") || "Payment & Delivery Information"}
            </h3>

            {/* Delivery Method */}
            <div>
              <label
                className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
              >
                {t("delivery_method") || "Delivery Method"}
              </label>
              <select
                value={formData.deliveryMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryMethod: e.target.value as any,
                  }))
                }
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="pickup">{t("pickup") || "Pickup"}</option>
                <option value="delivery">{t("delivery") || "Delivery"}</option>
                <option value="digital">{t("digital") || "Digital"}</option>
              </select>
            </div>

            {/* Delivery Address (if delivery selected) */}
            {formData.deliveryMethod === "delivery" && (
              <>
                <div>
                  <label
                    className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
                  >
                    {t("delivery_address") || "Delivery Address"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryAddress: e.target.value,
                      }))
                    }
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${isRTL ? "text-right" : ""} ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    } ${errors.deliveryAddress ? "border-red-500" : ""}`}
                  />
                  {errors.deliveryAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deliveryAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
                  >
                    {t("delivery_fee") || "Delivery Fee"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryFee}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryFee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </>
            )}

            {/* Delivery Instructions */}
            <div>
              <label
                className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
              >
                {t("delivery_instructions") || "Delivery Instructions"}
              </label>
              <textarea
                value={formData.deliveryInstructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryInstructions: e.target.value,
                  }))
                }
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${isRTL ? "text-right" : ""} ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Payment Amounts */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <h4 className="text-sm mb-3">
                {t("payment_breakdown") || "Payment Breakdown"}
              </h4>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
                  >
                    {t("voucher_amount") || "Voucher Amount"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={formData.voucherAmount}
                    onChange={(e) => {
                      const voucher = parseFloat(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        voucherAmount: voucher,
                        creditCardAmount: totalAmount - voucher,
                      }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                      theme === "dark"
                        ? "bg-gray-900 border-gray-600 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
                  >
                    {t("credit_card_amount") || "Credit Card Amount"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={formData.creditCardAmount}
                    onChange={(e) => {
                      const creditCard = parseFloat(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        creditCardAmount: creditCard,
                        voucherAmount: totalAmount - creditCard,
                      }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                      theme === "dark"
                        ? "bg-gray-900 border-gray-600 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div
                  className={`pt-3 border-t flex justify-between ${theme === "dark" ? "border-gray-700" : "border-gray-300"} ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>{t("total") || "Total"}:</span>
                  <span className="font-bold">
                    ₪{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              {errors.payment && (
                <p className="text-red-500 text-xs mt-2">{errors.payment}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg mb-4">
              {t("review_order") || "Review Order"}
            </h3>

            {/* Customer Info */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <h4 className="text-sm mb-2 font-medium">
                {t("customer_information") || "Customer Information"}
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {t("name") || "Name"}:
                  </span>{" "}
                  {formData.purchaserName}
                </p>
                <p>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {t("email") || "Email"}:
                  </span>{" "}
                  {formData.email}
                </p>
                <p>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {t("phone") || "Phone"}:
                  </span>{" "}
                  {formData.phone}
                </p>
              </div>
            </div>

            {/* Products */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <h4 className="text-sm mb-2 font-medium">
                {t("products_ordered") || "Products"}
              </h4>
              <div className="space-y-2">
                {formData.products.map((product, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span>
                      {product.quantity}x {product.name}
                    </span>
                    <span>
                      ₪{(product.quantity * product.unitPrice).toLocaleString()}
                    </span>
                  </div>
                ))}
                {formData.deliveryFee > 0 && (
                  <div
                    className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span>{t("delivery_fee") || "Delivery Fee"}</span>
                    <span>₪{formData.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div
                  className={`pt-2 border-t flex justify-between font-medium ${theme === "dark" ? "border-gray-700" : "border-gray-300"} ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>{t("total") || "Total"}</span>
                  <span>₪{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment & Delivery */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <h4 className="text-sm mb-2 font-medium">
                {t("payment_delivery_info") || "Payment & Delivery"}
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {t("delivery_method") || "Delivery Method"}:
                  </span>{" "}
                  {formData.deliveryMethod}
                </p>
                {formData.deliveryAddress && (
                  <p>
                    <span
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      {t("delivery_address") || "Address"}:
                    </span>{" "}
                    {formData.deliveryAddress}
                  </p>
                )}
                <p>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {t("voucher_amount") || "Voucher"}:
                  </span>{" "}
                  ₪{formData.voucherAmount.toLocaleString()}
                </p>
                <p>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {t("credit_card_amount") || "Credit Card"}:
                  </span>{" "}
                  ₪{formData.creditCardAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isSaving || isCreating}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </ModalWrapper>
  );
}

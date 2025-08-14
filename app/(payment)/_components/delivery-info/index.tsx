"use client";

import { memo } from "react";
import { SubmitButton } from "@/components/ui";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";
import useCheckoutStore from "@/stores/checkoutStore";
import { ProductSelector } from "./ProductSelector";
import { TabSelector } from "./TabSelector";
import { GiftReceiverForm } from "./GiftReceiverForm";
import { DeliveryOptions } from "./DeliveryOptions";
import { useDeliveryInfo } from "@/hooks";

const tabs = [paymentPageLabels.forMe, paymentPageLabels.forGift];

const DeliveryInfo = memo(
  ({ secondInfo, handleToggle, className }: DeliveryInfoProps) => {
    const { isStepOneSubmitBtnDisabled } = useCheckoutStore();

    const {
      deliveryInfos,
      clickedProductId,
      isSubmitting,
      register,
      errors,
      handleSubmit,
      updateDeliveryInfo,
      handleInputChange,
      handleProductClick,
      submitDeliveryInfo,
      validateDeliveryInfo,
    } = useDeliveryInfo(handleToggle);

    const isButtonDisabled = deliveryInfos?.some(
      (item) => !validateDeliveryInfo(item),
    );

    return (
      <div
        className={`bg-white p-4 max-sm:mx-3 rounded-md flex flex-col gap-4 shadow ${className}`}
      >
        <button
          aria-expanded={secondInfo}
          onClick={() => handleToggle("second")}
          className="flex justify-between cursor-pointer"
        >
          <span
            className={`font-bold text-[16px] ${
              secondInfo ? "text-black" : "text-darkPrimary"
            }`}
          >
            2. {paymentPageLabels.sending}
          </span>
        </button>

        {secondInfo && (
          <>
            <ProductSelector
              products={deliveryInfos}
              clickedProductId={clickedProductId}
              onProductClick={handleProductClick}
            />

            {deliveryInfos.map(
              (product) =>
                clickedProductId === product._id && (
                  <section key={product._id} className="space-y-4">
                    <TabSelector
                      tabs={tabs}
                      activeTab={product.activeTab}
                      onTabChange={(index) =>
                        updateDeliveryInfo(product._id, { activeTab: index })
                      }
                    />

                    {product.activeTab === 1 && (
                      <GiftReceiverForm
                        giftReceiverInfo={product.giftReceiverInfo}
                        register={register}
                        errors={errors}
                        onInputChange={(fieldId, value) =>
                          handleInputChange(
                            product._id,
                            "giftReceiverInfo",
                            fieldId,
                            value,
                          )
                        }
                      />
                    )}

                    <DeliveryOptions
                      product={product}
                      onUpdateDeliveryInfo={(updates) =>
                        updateDeliveryInfo(product._id, updates)
                      }
                      register={register}
                      errors={errors}
                      onInputChange={(fieldType, fieldId, value) =>
                        handleInputChange(
                          product._id,
                          fieldType as any,
                          fieldId,
                          value,
                        )
                      }
                    />
                  </section>
                ),
            )}

            <form
              onSubmit={handleSubmit(submitDeliveryInfo)}
              className="flex justify-end"
            >
              <SubmitButton
                isDisabled={
                  isButtonDisabled || isSubmitting || isStepOneSubmitBtnDisabled
                }
                label={buttonLabels.paymentIsOnGoing}
              />
            </form>
          </>
        )}
      </div>
    );
  },
);

DeliveryInfo.displayName = "DeliveryInfo";

export default DeliveryInfo;

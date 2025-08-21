"use client";

import { memo } from "react";

import { itemTypeEnum } from "@/lib/utils";
import { useDeliveryInfo } from "@/hooks";
import { TabSelector } from "./TabSelector";
import { SubmitButton } from "@/components/ui";
import useCheckoutStore from "@/stores/checkoutStore";
import { ProductSelector } from "./ProductSelector";
import { GiftReceiverForm } from "./GiftReceiverForm";
import { DeliveryOptions } from "./DeliveryOptions";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";

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
              (item) =>
                clickedProductId === item._id && (
                  <section key={item._id} className="space-y-4">
                    <TabSelector
                      tabs={tabs}
                      activeTab={item.activeTab}
                      onTabChange={(index) =>
                        updateDeliveryInfo(item._id, { activeTab: index })
                      }
                    />

                    {item.activeTab === 1 && (
                      <GiftReceiverForm
                        giftReceiverInfo={item.giftReceiverInfo}
                        register={register}
                        errors={errors}
                        onInputChange={(fieldId, value) =>
                          handleInputChange(
                            item._id,
                            "giftReceiverInfo",
                            fieldId,
                            value,
                          )
                        }
                      />
                    )}

                    {item.itemType === itemTypeEnum.product && (
                      <DeliveryOptions
                        product={item}
                        onUpdateDeliveryInfo={(updates) =>
                          updateDeliveryInfo(item._id, updates)
                        }
                        register={register}
                        errors={errors}
                        onInputChange={(fieldType, fieldId, value) =>
                          handleInputChange(
                            item._id,
                            fieldType as any,
                            fieldId,
                            value,
                          )
                        }
                      />
                    )}
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

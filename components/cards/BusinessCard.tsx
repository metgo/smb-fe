"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react';

import { handleCropImage } from '@/lib/helpers';
import { tempCardInfo } from '@/constant/hebrew';
import useGeneralStore from '@/stores/generalStore';
import { categoryGradientClasses } from '@/lib/utils';
import LocalStorageService from '@/lib/localStorage';
import { IconImage } from '@/components/ui';


const BusinessCard = ({
  height,
  width,
  business,
}: BusinessCardProps) => {
  const { activeCategoryKey, setActiveFilterTab } = useGeneralStore()
  const aspectRatio = width / height;
  const existingFaviourtBusiness = LocalStorageService.get<FaviouriteBusinessProps[]>("favorite-business") || [];

  const [isLoading, setIsLoading] = useState(false)
  const [croppedImageUrl, setCroppedImageUrl] = useState("")
  useEffect(() => {
    let timer: NodeJS.Timeout;
    setIsLoading(false);
    handleCropImage(business?.images[0], aspectRatio, setIsLoading, (croppedUrl: string) => {
      timer = setTimeout(() => {
        setCroppedImageUrl(croppedUrl);
        setIsLoading(false);
      }, 4000);
    });
    return () => clearTimeout(timer);
  }, []);

  function addWishlistHandler() {
    LocalStorageService.remove("favorite-business");
    const item: FaviouriteBusinessProps = {
      height,
      width,
      _id: business._id,
      name: business.name,
      imageUrl: croppedImageUrl,
      location: tempCardInfo.location,
    };

    // Step 2: Check if it's already in favorites (optional)
    const isAlreadyAdded = existingFaviourtBusiness.some(b => b._id === item._id);
    if (isAlreadyAdded) {
      console.log("Item already in wishlist");
      return;
    }

    // Step 3: Add the new item
    const updated = [...existingFaviourtBusiness, item];

    // Step 4: Save updated list
    LocalStorageService.set<FaviouriteBusinessProps[]>("favorite-business", updated);
  }

  const primaryCategoryId = activeCategoryKey ? activeCategoryKey : business?.primaryCategoryId ? business?.primaryCategoryId : "6566e36ba77d2a477266d2f4"

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      {(isLoading) ?
        <div className={` rounded-2xl skeleton w-full h-full ${categoryGradientClasses[primaryCategoryId]}`} /> :
        <div className="w-full h-full relative group rounded-xl overflow-hidden">
          <Image
            fill
            priority
            unoptimized
            quality={100}
            alt={business?.images[0]?.alt || "Business Image"}
            src={croppedImageUrl || business?.images[0]?.image || "/images/image-placeholder.jpg"}
            className="object-cover h-full w-full rounded-xl"
          />
          <div className="relative w-full h-full overflow-hidden">
            {/* Overlay (only bottom 50%) */}
            <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent" />

            {/* Text Content */}
            <div className="absolute bottom-0 right-0 ps-4 pb-4 text-white font-bold w-full">
              <h3 className="lg:text-[1rem] 3xl:text-[1.5rem]">{business?.name}</h3>
              <div className="flex items-center gap-2">
                <IconImage icon="location" width={20} height={20} />
                <span className="md:text-sm">{business?.address?.city ? business?.address?.city : "Tel Aviv"}</span>
              </div>
            </div>
          </div>


          <div className="hidden absolute top-4 right-4 group-hover:flex items-center gap-2.5">
            <IconImage width={30} height={30} icon='circular-heart' onClick={addWishlistHandler} />
            <IconImage width={30} height={30} icon='circular-map-fold' onClick={() => setActiveFilterTab("map")} />
          </div>
        </div>
      }
    </div>
  )
}

export default BusinessCard
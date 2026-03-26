"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { NextImage } from "@/components/ui";

const ProductGallery = ({
  images,
  name,
}: {
  images: ImageItem[];
  name: string;
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images?.length) return null;

  return (
    <div className="relative h-[400px] sm:h-[500px] bg-gray-200">
      <NextImage
        isFill
        key={selectedImage}
        imgSrc={images[selectedImage]?.image}
        alt={images[selectedImage]?.alt || name}
        className="w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setSelectedImage((prev) =>
                prev === images.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-20"
          >
            <ArrowRight className="w-6 h-6 text-gray-900 rotate-180" />
          </button>

          <button
            onClick={() =>
              setSelectedImage((prev) =>
                prev === 0 ? images.length - 1 : prev - 1,
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-20"
          >
            <ArrowRight className="w-6 h-6 text-gray-900" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="flex gap-2">
              {images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all ${
                    selectedImage === index
                      ? "ring-3 ring-teal-400 opacity-100 scale-105 shadow-2xl"
                      : "opacity-60 hover:opacity-100 hover:scale-105 shadow-xl"
                  }`}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))",
                  }}
                >
                  <NextImage
                    width={80}
                    height={80}
                    imgSrc={img.image}
                    alt={img.alt || `תמונה ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductGallery;

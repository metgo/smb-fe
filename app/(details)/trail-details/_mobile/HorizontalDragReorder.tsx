"use client";

import React, { useState } from "react";

const DragReorderGallery: React.FC = () => {
  const [images, setImages] = useState<string[]>([
    "https://picsum.photos/200?random=1",
    "https://picsum.photos/200?random=2",
    "https://picsum.photos/200?random=3",
    "https://picsum.photos/200?random=4",
    "https://picsum.photos/200?random=5",
    "https://picsum.photos/200?random=6",
    "https://picsum.photos/200?random=7",
    "https://picsum.photos/200?random=8",
    "https://picsum.photos/200?random=9",
    "https://picsum.photos/200?random=10",
    "https://picsum.photos/200?random=11",
    "https://picsum.photos/200?random=12",
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLImageElement>,
    index: number,
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...images];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);

    setDraggedIndex(index);
    setImages(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div
      // style={{
      //   gap: '12px',
      //   width: '400px',
      // }}
      className="flex w-40 "
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDragEnd={handleDragEnd}
          style={{
            width: "100%",
            height: "100px",
            objectFit: "cover",
            borderRadius: "8px",
            cursor: "grab",
            opacity: draggedIndex === i ? 0.5 : 1,
            transform: draggedIndex === i ? "scale(0.95)" : "scale(1)",
            transition: "transform 0.2s, opacity 0.2s",
          }}
        />
      ))}
    </div>
  );
};

export default DragReorderGallery;

"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
//import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  return (
    <div className="space-y-4">
      <Image
        src={images[selectedImage]}
        alt="Large Product Image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover
        object-center"
      ></Image>
      <div className="flex">
        {images.map((image, index) => (
          <div
            key={`image ${index + 1}`}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "border mr-2 cursor-pointer hover:border-orange-500",
              selectedImage === index && "border-orange-600"
            )}
          >
            <Image
              src={image}
              alt={`Product Image ${index + 1}`}
              width={100}
              height={100}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;

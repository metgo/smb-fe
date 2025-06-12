import { EightImageLayout, ElevenImageLayout, FiveImageLayout, FourImageLayout, NineImageLayout, OneImageLayout, SevenImageLayout, SixImageLayout, TenImageLayout, ThirteenImageLayout, ThreeImageLayout, TwelveImageLayout, TwoImageLayout } from "@/components/layouts"

const imageCount: number = 1;

const page = () => {
  const renderLayout = () => {
    switch (imageCount) {
      case 1:
        return <OneImageLayout/>
      case 2:
        return <TwoImageLayout />
      case 3:
        return <ThreeImageLayout />
      case 4:
        return <FourImageLayout />
      case 5:
        return <FiveImageLayout />
      case 6:
        return <SixImageLayout />
      case 7:
        return <SevenImageLayout />;
      case 8:
        return <EightImageLayout />;
      case 9:
        return <NineImageLayout />;
      case 10:
        return <TenImageLayout />;
      case 11:
        return <ElevenImageLayout />
      case 12:
        return <TwelveImageLayout />
      case 13:
        return <ThirteenImageLayout />

      // Add more cases as needed
      default:
        return <div>No matching layout found for image count: {imageCount}</div>;
    }
  };

  return <>{renderLayout()}</>;
};

export default page;

import { blogDetails } from "@/constant/placeholderData";
import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import { ImageGallery, ReturnToPrevPageBtn } from "../../_components";

const page = () => {
  return (
    <div>
      <ReturnToPrevPageBtn />
      <div className="mx-20 py-12">
        <div className="mb-4.5">
          <h1 className="font-bold text-[2.5rem]">{blogDetails.title}</h1>
          <div className="flex items-center justify-between">
            <p className="font-normal">{blogDetails.shortDesc}</p>
            <ShareUrlBtnModal />
          </div>
        </div>

        <ImageGallery images={blogDetails.images} primaryCategoryId="" />
        <div className="max-w-[50rem] mx-auto mt-16">
          <p className="font-normal">{blogDetails.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default page;

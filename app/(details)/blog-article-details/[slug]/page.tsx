import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import { ReturnToPrevPageBtn } from "../../_components";
import NoFeedItemLayout from "@/components/layouts/NoFeedItemLayout";
import { getBusinessById } from "@/actions/businessActions";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoFeedItemLayout />;

  const articleDetails = await getBusinessById(slug);

  return (
    <div>
      <ReturnToPrevPageBtn />
      <div className="mx-20 py-12">
        <div className="mb-4.5">
          <h1 className="font-bold text-[2.5rem]">{articleDetails.title}</h1>
          <div className="flex items-center justify-between">
            <p className="font-normal">{articleDetails.shortDesc}</p>
            <ShareUrlBtnModal />
          </div>
        </div>

        {/* <ImageGallery images={articleDetails.images} primaryCategoryId="" /> */}
        <div className="max-w-[50rem] mx-auto mt-16">
          <p className="font-normal">{articleDetails.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default page;
